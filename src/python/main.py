import os
from fastapi import FastAPI, HTTPException
from sentence_transformers import SentenceTransformer
from pymongo import AsyncMongoClient
from bson import ObjectId
from typing import Optional
from models import DrugSchema
from dotenv import load_dotenv
from sentence_transformers import util
import torch

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Load model once at startup
model = SentenceTransformer('all-MiniLM-L6-v2')

# Connect to MongoDB using the .env variable, with a fallback for local dev
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncMongoClient(MONGO_URI)

db = client.PAIS
collection = db.drugs

#------------------------------------------------------------------------
#drug management
#------------------------------------------------------------------------

from sentence_transformers import util
import torch

@app.get("/drugs-alternatives/{drug_id}/")
async def get_alternatives(drug_id: str, top_k: int = 5):
    # 1. Fetch the target drug
    target_drug = await collection.find_one({"_id": ObjectId(drug_id)})
    if not target_drug or "embedding" not in target_drug:
        raise HTTPException(status_code=404, detail="Drug or vector not found")

    # 2. Fetch all other drugs that have embeddings
    cursor = collection.find({
        "embedding": {"$exists": True, "$ne": []}, 
        "_id": {"$ne": ObjectId(drug_id)}
    })
    all_drugs = await cursor.to_list(length=1000) 

    if not all_drugs:
        return []

    # 3. Calculate similarity using Python
    target_vector = torch.tensor(target_drug["embedding"])
    other_vectors = torch.tensor([d["embedding"] for d in all_drugs])
    
    # Compute cosine similarity
    cos_scores = util.cos_sim(target_vector, other_vectors)[0]

    # 4. Map scores and FILTER (Only 0.7 or higher)
    scored_drugs = []
    for i, score in enumerate(cos_scores):
        score_val = float(score)
        
        # --- THIS IS THE FILTER ---
        if score_val >= 0.70: 
            drug_data = all_drugs[i]
            drug_data["score"] = round(score_val * 100, 2) # Convert to percentage (e.g. 85.5)
            scored_drugs.append(drug_data)

    # 5. Sort by score descending
    scored_drugs.sort(key=lambda x: x["score"], reverse=True)

    # 6. Cleanup and return top_k
    final_results = scored_drugs[:top_k]
    for doc in final_results:
        doc["_id"] = str(doc["_id"])
        if "embedding" in doc:
            del doc["embedding"] 
        
    return final_results

    #------------------------------------------------------------------------
    #anlytics heatmap
    #------------------------------------------------------------------------

