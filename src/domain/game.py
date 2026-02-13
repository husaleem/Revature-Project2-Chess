import uuid
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Integer, Float, Boolean, Enum, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from src.base import Base


#game_id (PK)
#tournament_id (FK)
#result (enum/varchar: WHITE_WIN | BLACK_WIN | DRAW)
#player_white (FK)
#playter_black (FK)
#played_at (timestamp) (nice add later)

class WinState(str, PyEnum):
    WHITE_WIN = "WHITE_WIN"
    BLACK_WIN = "BLACK_WIN"
    DRAW = "DRAW"

class Game(Base):
    __tablename__ = "games"

    game_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4())
    tournament_id = Column(UUID(as_uuid=True), nullable=False)
    player_white_id = Column(UUID(as_uuid=True), nullable=True)
    player_black_id = Column(UUID(as_uuid=True), nullable=True)
    result = Column(Enum(WinState, name="win_state"), nullable=True)
    played_at = Column(TIMESTAMP(timezone=True), nullable=True)

