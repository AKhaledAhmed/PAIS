from pydantic import BaseModel, Field
from typing import List, Optional

class DrugSchema(BaseModel):
    name: str
    composition: List[str] = Field(..., min_items=1)
    category: str
    dosageForm: str
    strength: List[str] = []
    uses: str = Field(..., min_length=5)
    sideEffects: Optional[str] = None
    requiresPrescription: bool = False
    manufacturer: Optional[str] = None
    imageUrl: Optional[str] = None
    isbn: Optional[str] = None
    price: float = Field(..., gt=0)
    embedding: List[float] = []

    class Config:
        populate_by_name = True