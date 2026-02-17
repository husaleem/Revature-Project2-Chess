from typing import Optional

from pydantic import BaseModel
from uuid import UUID


class PlayerTopStatsResponseRead(BaseModel):
    player_id: UUID
    first_name: str
    last_name: str
    rating: Optional[int] = None
    winLoss: Optional[float] = None
    drawPercent: float = 0.0
    avgOppRating: Optional[float] = None

    class Config:
        from_attributes = True