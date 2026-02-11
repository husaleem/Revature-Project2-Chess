from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class PlayerCreate(BaseModel):
    first_name: str
    last_name: str
    rating: Optional[int] = 0


class PlayerRead(BaseModel):
    player_id: UUID
    first_name: str
    last_name: str
    rating: int

    class Config:
        from_attributes = True
        fields = {"player_id": ..., "first_name": ..., "last_name": ..., "rating": ...}
