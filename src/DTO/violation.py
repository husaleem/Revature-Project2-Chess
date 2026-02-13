from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class ViolationCreate(BaseModel):
    player_id: UUID
    game_id: UUID
    violation_type: str
    violation_date: datetime
    consequence: Optional[str] = None


class ViolationRead(ViolationCreate):
    violation_id: UUID

    class Config:
        from_attributes = True


class ViolationUpdate(BaseModel):
    violation_type: Optional[str] = None
    violation_date: Optional[datetime] = None
    consequence: Optional[str] = None