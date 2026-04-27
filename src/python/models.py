from pydantic import BaseModel, Field
from typing import List, Optional

class DrugSchema(BaseModel):
    # These must match the keys in your Node.js drug.js exactly
    name: str
    composition: List[str] = Field(..., min_items=1)
    category: str
    dosageForm: str
    uses:str = Field(..., min_length=5)
    # This is the AI vector we will generate
    embedding: List[float] = []

    class Config:
        # This allows Python to handle the MongoDB _id if you pass it
        populate_by_name = True