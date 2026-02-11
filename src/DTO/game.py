from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from src.DTO.game import WinState

class GameCreate(BaseModel):
    tournament_id: UUID
    result: WinState
    played_at: datetime

class GameRead(GameCreate):
    game_id: UUID
    tournament_id: UUID

    class Config:
        from_attributes = True