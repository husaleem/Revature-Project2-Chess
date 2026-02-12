from typing import Optional
from pydantic import BaseModel

class SkillLevelCreate(BaseModel):
    title: str
    rating_lower_bound: int
    rating_upper_bound: int
    
class SkillLevelRead(BaseModel):
    title = str
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
    title: Optional[str] = None
    rating_lower_bound: Optional[int] = None
    rating_upper_bound: Optional[int] = None
    