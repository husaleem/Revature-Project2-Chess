from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, Integer, String, ForeignKey
from src.base import Base


class GamePlayer(Base):
    __tablename__ = "game_player"

    game_id = Column(UUID(as_uuid=True), ForeignKey("games.game_id"), primary_key=True)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.player_id"), primary_key=True)
    color = Column(String(10), nullable=False)
    result = Column(String(10), nullable=False)
