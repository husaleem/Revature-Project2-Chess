from typing import Optional
from pydantic import BaseModel, Field

class SkillLevelCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=50)
    rating_lower_bound: int = Field(..., ge=0)
    rating_upper_bound: int = Field(..., ge=0)

class SkillLevelRead(BaseModel):
    title: str
    rating_lower_bound: int
    rating_upper_bound: int

    class Config:
        from_attributes = True
        fields = {
            "title": ...,
            "rating_lower_bound": ...,
            "rating_upper_bound": ...,
        }   

class SkillLevelUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=50)
    rating_lower_bound: Optional[int] = Field(None, ge=0)
    rating_upper_bound: Optional[int] = Field(None, ge=0)
