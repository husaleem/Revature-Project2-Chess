from sqlalchemy import Column, Integer, String, ForeignKey
from src.base import Base


class GamePlayer(Base):
    __tablename__ = "game_player"

    game_id = Column(Integer, ForeignKey("games.game_id"), primary_key=True)
    player_id = Column(Integer, ForeignKey("players.player_id"), primary_key=True)
    color = Column(String(10), nullable=False)
    result = Column(String(10), nullable=False)
