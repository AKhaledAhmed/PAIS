import os
from fastapi import FastAPI, HTTPException
from sentence_transformers import SentenceTransformer
from pymongo import AsyncMongoClient
from bson import ObjectId
from bson.errors import InvalidId 
from typing import Optional
from models import DrugSchema
from dotenv import load_dotenv
from sentence_transformers import util
import torch
from pathlib import Path
import pandas as pd
import xgboost as xgb
import joblib
from datetime import datetime, timedelta, timezone

# 1. Environment Loading
load_dotenv() 
if not os.getenv("MONGO_URI"):
    load_dotenv(dotenv_path=Path(".") / ".env")
if not os.getenv("MONGO_URI"):
    load_dotenv(dotenv_path=Path("..") / ".env")

app = FastAPI()

# 2. AI Model Loading
model = SentenceTransformer('all-MiniLM-L6-v2')

# 3. Database Connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncMongoClient(MONGO_URI)
db = client.PAIS
collection = db.drugs

# ────────────────────────────────────────────────────────────
# UTILS
# ────────────────────────────────────────────────────────────

def generate_embedding(drug: DrugSchema):
    text = f"{drug.name} {' '.join(drug.composition)} {drug.uses}"
    return model.encode(text).tolist()

# ────────────────────────────────────────────────────────────
# DRUG MANAGEMENT (CRUD)
# ────────────────────────────────────────────────────────────

@app.post("/drugs-management/")
async def add_drug(drug: DrugSchema):
    existing = await collection.find_one({"name": drug.name})
    if existing:
        raise HTTPException(status_code=400, detail="Drug already exists")

    drug_dict = drug.model_dump()
    drug_dict["embedding"] = generate_embedding(drug)
    
    result = await collection.insert_one(drug_dict)
    drug_dict["_id"] = str(result.inserted_id)
    return drug_dict

@app.put("/drugs-management/{drug_id}")
async def update_drug(drug_id: str, drug: DrugSchema):
    try:
        oid = ObjectId(drug_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    drug_dict = drug.model_dump()
    drug_dict["embedding"] = generate_embedding(drug)

    result = await collection.replace_one({"_id": oid}, drug_dict)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Drug not found")
    
    drug_dict["_id"] = drug_id
    return drug_dict

@app.delete("/drugs-management/{drug_id}")
async def delete_drug(drug_id: str):
    try:
        result = await collection.delete_one({"_id": ObjectId(drug_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Drug not found")
        return {"success": True}
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

# ────────────────────────────────────────────────────────────
# DRUG ALTERNATIVES (Semantic Search)
# ────────────────────────────────────────────────────────────

@app.get("/drugs-alternatives/{drug_id}/")
async def get_alternatives(drug_id: str, top_k: int = 5):
    try:
        oid = ObjectId(drug_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid drug ID format")

    target_drug = await collection.find_one({"_id": oid})
    if not target_drug or "embedding" not in target_drug:
        raise HTTPException(status_code=404, detail="Drug or vector not found")

    cursor = collection.find({
        "embedding": {"$exists": True, "$ne": []},
        "_id": {"$ne": oid}
    })
    all_drugs = await cursor.to_list(length=1000)

    if not all_drugs:
        return []

    target_vector = torch.tensor(target_drug["embedding"])
    other_vectors = torch.tensor([d["embedding"] for d in all_drugs])
    cos_scores = util.cos_sim(target_vector, other_vectors)[0]

    scored_drugs = []
    for i, score in enumerate(cos_scores):
        score_val = float(score)
        if score_val >= 0.70:
            drug_data = all_drugs[i]
            drug_data["score"] = round(score_val * 100, 2)
            scored_drugs.append(drug_data)

    scored_drugs.sort(key=lambda x: x["score"], reverse=True)
    final_results = scored_drugs[:top_k]
    for doc in final_results:
        doc["_id"] = str(doc["_id"])
        if "embedding" in doc:
            del doc["embedding"]

    return final_results

# ────────────────────────────────────────────────────────────
# DEMAND PREDICTION MODEL (XGBoost)
# ────────────────────────────────────────────────────────────

@app.post("/model/train")
async def train_model():
    all_dbs = await client.list_database_names()
    correct_db_name = None
    for name in all_dbs:
        cols = await client[name].list_collection_names()
        if any("searchlog" in c.lower() for c in cols):
            correct_db_name = name
            break

    if not correct_db_name:
        raise HTTPException(status_code=404, detail="No searchlogs found in Atlas.")

    logs = await client[correct_db_name].searchlogs.find().to_list(length=80000)
    df = pd.DataFrame(logs)
    # XGBoost logic usually goes here to save 'pais_demand_forecaster.pkl'
    return {"status": "Trained", "db_used": correct_db_name, "count": len(df)}

#-────────────────────────────────────────────────────────────
# DEMAND PREDICTION (Inference)
#-────────────────────────────────────────────────────────────
@app.get("/model/predict/{pharmacy_id}")
async def predict_demand(pharmacy_id: str):
    if not os.path.exists('pais_demand_forecaster.pkl'):
        raise HTTPException(status_code=400, detail="Model file not found. Train first.")
        
    model_xgb = joblib.load('pais_demand_forecaster.pkl')
    now = datetime.now(timezone.utc)
    
    inventory = await db.inventories.find({"pharmacyId": ObjectId(pharmacy_id)}).to_list(length=2000)
    predictions = []
    
    for item in inventory:
        # BUG FIX: Model expects 4 features. Adding Year to reach 4.
        # Order: [Year, Month, Week, Weekday]
        features = [[
            now.year, 
            now.month, 
            now.isocalendar()[1] + 1, 
            now.weekday()
        ]] 
        
        pred_demand = model_xgb.predict(features)[0]
        
        suggested_stock = round(pred_demand * 1.2)
        raise_amount = max(0, suggested_stock - item["stockQuantity"])
        status = "CRITICAL" if pred_demand > item["stockQuantity"] else "SAFE"
        
        predictions.append({
            "drugId": str(item["drugId"]),
            "expected_demand": round(float(pred_demand), 2),
            "suggested_raise": raise_amount,
            "status": status
        })
        
    return sorted(predictions, key=lambda x: x['expected_demand'], reverse=True)

# ────────────────────────────────────────────────────────────
# DEMAND HEATMAP (Geospatial)
# ────────────────────────────────────────────────────────────

@app.get("/analytics/heatmap/{pharmacy_id}")
async def get_demand_heatmap(pharmacy_id: str):
    # 1. Validate ID format
    try:
        oid = ObjectId(pharmacy_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail=f"Invalid ID format: {pharmacy_id}")

    # 2. Fetch pharmacy (Only once)
    pharmacy = await db.pharmacies.find_one({"_id": oid})
    if not pharmacy:
         raise HTTPException(status_code=404, detail="Pharmacy not found")

    # 3. Time calculation
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    
    # 4. Aggregation Pipeline
    pipeline = [
        {
            "$geoNear": {
                "near": pharmacy["location"],
                "distanceField": "dist",
                "maxDistance": 5000,
                "query": {"createdAt": {"$gte": seven_days_ago}},
                "spherical": True
            }
        },
        {
            "$group": {
                "_id": {
                    "lat": {"$arrayElemAt": ["$location.coordinates", 1]},
                    "lng": {"$arrayElemAt": ["$location.coordinates", 0]}
                },
                "weight": {"$sum": 1}
            }
        }
    ]
    
    # 5. Resolve cursor and return
    cursor = await db.searchlogs.aggregate(pipeline) 
    heatmap_points = await cursor.to_list(length=1000)
    return heatmap_points