import os
import pandas as pd
import xgboost as xgb
import joblib
import torch
from fastapi import FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from bson.errors import InvalidId 
from sentence_transformers import SentenceTransformer, util
from datetime import datetime, timedelta, timezone
from typing import Optional
from models import DrugSchema
from dotenv import load_dotenv

# 1. Environment & Global Config
load_dotenv() 
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MODEL_PATH = 'pais_demand_forecaster.pkl'

app = FastAPI()

# --- GLOBAL MODEL CACHE ---
# This ensures the model stays in RAM and doesn't reload on every request
xgb_model = None 
if os.path.exists(MODEL_PATH):
    try:
        xgb_model = joblib.load(MODEL_PATH)
        print("✅ AI Model loaded into memory successfully.")
    except Exception as e:
        print(f"❌ Load Error: {e}")

# 2. AI Model Loading (Semantic Search)
model = SentenceTransformer('all-MiniLM-L6-v2')

# 3. Database Connection
client = AsyncIOMotorClient(MONGO_URI)
db = client.PAIS
collection = db.drugs

# ────────────────────────────────────────────────────────────
# UTILS & DRUG MANAGEMENT
# ────────────────────────────────────────────────────────────

def generate_embedding(drug: DrugSchema):
    text = f"{drug.name} {' '.join(drug.composition)} {drug.uses}"
    return model.encode(text).tolist()

@app.post("/drugs-management/")
async def add_drug(drug: DrugSchema):
    existing = await collection.find_one({"name": drug.name})
    if existing: raise HTTPException(status_code=400, detail="Drug already exists")
    drug_dict = drug.model_dump()
    drug_dict["embedding"] = generate_embedding(drug)
    result = await collection.insert_one(drug_dict)
    drug_dict["_id"] = str(result.inserted_id)
    return drug_dict

@app.put("/drugs-management/{drug_id}")
async def update_drug(drug_id: str, drug: DrugSchema):
    try: oid = ObjectId(drug_id)
    except: raise HTTPException(status_code=400, detail="Invalid ID")
    drug_dict = drug.model_dump()
    drug_dict["embedding"] = generate_embedding(drug)
    result = await collection.replace_one({"_id": oid}, drug_dict)
    if result.matched_count == 0: raise HTTPException(status_code=404, detail="Not found")
    drug_dict["_id"] = drug_id
    return drug_dict

@app.delete("/drugs-management/{drug_id}")
async def delete_drug(drug_id: str):
    try:
        result = await collection.delete_one({"_id": ObjectId(drug_id)})
        if result.deleted_count == 0: raise HTTPException(status_code=404, detail="Not found")
        return {"success": True}
    except: raise HTTPException(status_code=400, detail="Invalid ID")

# ────────────────────────────────────────────────────────────
# AI TRAINING (XGBOOST)
# ────────────────────────────────────────────────────────────

@app.post("/model/train")
async def train_model():
    global xgb_model
    logs = await db.searchlogs.find().to_list(length=80000)
    if not logs: raise HTTPException(status_code=404, detail="No logs found")
    
    df = pd.DataFrame(logs)
    if 'createdAt' not in df.columns: df.rename(columns={'createdat': 'createdAt'}, inplace=True)
    df['createdAt'] = pd.to_datetime(df['createdAt'])
    df['month'] = df['createdAt'].dt.month
    df['week'] = df['createdAt'].dt.isocalendar().week
    
    train_df = df.groupby(['query', 'month', 'week']).agg(
        search_count=('query', lambda x: x.str.contains('SEARCH', case=False).sum() or 1),
        view_count=('query', lambda x: x.str.contains('VIEW_DRUG', case=False).sum()),
        check_count=('query', lambda x: x.str.contains('CHECK_STOCK', case=False).sum())
    ).reset_index()

    train_df['weighted_demand'] = (train_df['search_count'] * 1) + (train_df['view_count'] * 2) + (train_df['check_count'] * 3)
    
    X = train_df[['month', 'week', 'view_count', 'check_count']]
    y = train_df['weighted_demand']
    
    new_model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.1)
    new_model.fit(X, y)
    
    joblib.dump(new_model, MODEL_PATH)
    xgb_model = new_model # Update the live memory cache immediately
    return {"status": "Success", "samples": len(train_df)}

# ────────────────────────────────────────────────────────────
# OPTIMIZED ANALYTICS & PREDICTIONS
# ────────────────────────────────────────────────────────────
# Initialize cache at the global level
cache = {}
@app.get("/model/predict/{pharmacy_id}")
async def predict_demand(pharmacy_id: str):
    # 1. Model Check
    if xgb_model is None:
        raise HTTPException(status_code=400, detail="Model not initialized. Train first.")
        
    # 2. Cache Check (The Speed Hack)
    # If this pharmacy requested data in the last 5 minutes, return it instantly
    if pharmacy_id in cache:
        last_time, data = cache[pharmacy_id]
        if (datetime.now(timezone.utc) - last_time).seconds < 300:
            return data

    now = datetime.now(timezone.utc)
    analysis_window = now - timedelta(days=60) 

    # 3. Database Retrieval
    pharmacy = await db.pharmacies.find_one({"_id": ObjectId(pharmacy_id)})
    inventory = await db.inventories.find({"pharmacyId": ObjectId(pharmacy_id)}).to_list(length=2000)
    
    if not inventory or not pharmacy: 
        return []

    drug_ids = [item["drugId"] for item in inventory]

    # 4. Batch Fetch Names (Join Optimization)
    drugs_data = await db.drugs.find({"_id": {"$in": drug_ids}}, {"name": 1}).to_list(None)
    name_map = {str(d["_id"]): d["name"] for d in drugs_data}

    # 5. Hyper-Local Aggregation (Geofenced Intent)
    pipeline = [
        {
            "$geoNear": {
                "near": pharmacy["location"],
                "distanceField": "dist",
                "maxDistance": 5000, 
                "query": { "results": {"$in": drug_ids}, "createdAt": {"$gte": analysis_window} },
                "spherical": True
            }
        },
        # Optimization: Discard unused fields immediately to save RAM
        {"$project": {"results": 1, "query": 1}}, 
        {"$unwind": "$results"},
        {"$group": {
            "_id": "$results",
            "views": {"$sum": {"$cond": [{"$regexMatch": {"input": "$query", "regex": "VIEW", "options": "i"}}, 1, 0]}},
            "checks": {"$sum": {"$cond": [{"$regexMatch": {"input": "$query", "regex": "CHECK", "options": "i"}}, 1, 0]}}
        }}
    ]
    
    cursor = db.searchlogs.aggregate(pipeline)
    stats_list = await cursor.to_list(length=None)
    stats_map = {str(s["_id"]): s for s in stats_list}
    
    # 6. Vectorized Prediction (Bulk AI Processing)
    all_features = [
        [now.month, now.isocalendar()[1] + 1, 
         stats_map.get(str(item["drugId"]), {}).get("views", 1), 
         stats_map.get(str(item["drugId"]), {}).get("checks", 0)] 
        for item in inventory
    ]

    feature_df = pd.DataFrame(all_features, columns=['month', 'week', 'view_count', 'check_count'])
    all_preds = xgb_model.predict(feature_df)

    # 7. Urgency Logic
    predictions = []
    for i, item in enumerate(inventory):
        d_id = str(item["drugId"])
        pred_val = float(all_preds[i])
        current_stock = item["stockQuantity"]
        
        # Proactive Status Check (80% threshold)
        if pred_val >= current_stock:
            status = "CRITICAL"
        elif pred_val >= (current_stock * 0.8):
            status = "WARNING"
        else:
            status = "SAFE"

        predictions.append({
            "drugId": d_id,
            "name": name_map.get(d_id, "Unknown"),
            "expected_demand": round(pred_val, 2),
            "suggested_raise": max(0, round(pred_val * 1.2) - current_stock),
            "status": status
        })
    
    # 8. Advanced Sorting & Cache Update
    def urgency_rank(x):
        status_weight = {"CRITICAL": 2, "WARNING": 1, "SAFE": 0}
        return (status_weight.get(x['status'], 0), x['suggested_raise'], x['expected_demand'])
    
    returned_data = sorted(predictions, key=urgency_rank, reverse=True)
    
    # Save to cache with UTC timestamp
    cache[pharmacy_id] = (datetime.now(timezone.utc), returned_data)   
    
    return returned_data

# ────────────────────────────────────────────────────────────
# OPPORTUNITIES & HEATMAP
# ────────────────────────────────────────────────────────────

@app.get("/model/opportunities/{pharmacy_id}")
async def get_inventory_opportunities(pharmacy_id: str):
    pharmacy = await db.pharmacies.find_one({"_id": ObjectId(pharmacy_id)})
    if not pharmacy: raise HTTPException(status_code=404, detail="Not found")
    
    pipeline = [
        {"$geoNear": {"near": pharmacy["location"], "distanceField": "dist", "maxDistance": 5000, "spherical": True}},
        {"$unwind": "$results"},
        {"$group": {"_id": "$results", "searchCount": {"$sum": 1}}},
        {"$sort": {"searchCount": -1}},
        {"$limit": 15}
    ]

    cursor = db.searchlogs.aggregate(pipeline) 
    local_trends = await cursor.to_list(length=15)
    
    inventory = await db.inventories.find({"pharmacyId": ObjectId(pharmacy_id)}).to_list(None)
    in_stock_ids = {str(i["drugId"]) for i in inventory}
    
    needed_ids = [trend["_id"] for trend in local_trends if str(trend["_id"]) not in in_stock_ids]
    drugs_data = await db.drugs.find({"_id": {"$in": needed_ids}}, {"name": 1}).to_list(None)
    name_map = {str(d["_id"]): d["name"] for d in drugs_data}
    
    opportunities = []
    for trend in local_trends:
        t_id = str(trend["_id"])
        if t_id not in in_stock_ids:
            opportunities.append({
                "drugId": t_id,
                "name": name_map.get(t_id, "Unknown"),
                "localDemand": trend["searchCount"],
                "status": "OPPORTUNITY"
            })
    return opportunities

@app.get("/analytics/heatmap/{pharmacy_id}")
async def get_demand_heatmap(pharmacy_id: str):
    pharmacy = await db.pharmacies.find_one({"_id": ObjectId(pharmacy_id)})
    if not pharmacy: raise HTTPException(status_code=404, detail="Not found")
    # Time window for heatmap points
    window = datetime.now(timezone.utc) - timedelta(days=60)
    
    pipeline = [
        {
            "$geoNear": {
                "near": pharmacy["location"],
                "distanceField": "dist", "maxDistance": 5000,
                "query": {"createdAt": {"$gte": window}},
                "spherical": True
            }
        },
        {"$group": {
            "_id": { "lat": {"$arrayElemAt": ["$location.coordinates", 1]}, "lng": {"$arrayElemAt": ["$location.coordinates", 0]} },
            "weight": {"$sum": 1}
        }}
    ]
    cursor = db.searchlogs.aggregate(pipeline) 
    return await cursor.to_list(length=1000)