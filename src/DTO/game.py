from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel
from src.domain.game import WinState

class GameCreate(BaseModel):
    tournament_id: UUID
    result: Optional[WinState] = None
    played_at: Optional[datetime] = None
    player_white_id: Optional[UUID] = None
    player_black_id: Optional[UUID] = None

class GameRead(GameCreate):
    game_id: UUID
    tournament_id: UUID
    player_white_id: Optional[UUID] = None
    player_black_id: Optional[UUID] = None

    result: Optional[WinState] = None
    played_at: Optional[datetime] = None

    class Config:
        from_attributes = True