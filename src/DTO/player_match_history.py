from typing import Optional

from pydantic import BaseModel
from uuid import UUID

from src.DTO.game import GameRead


class PlayerMatchHistoryRead(BaseModel):
    player_id: UUID
    first_name: str
    last_name: str
    match_history: Optional[list[GameRead]] = None

    class Config:
        from_attributes = True