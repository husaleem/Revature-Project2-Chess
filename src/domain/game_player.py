from sqlalchemy import Column, Integer, String, ForeignKey
from src.base import Base


class GamePlayer(Base):
    __tablename__ = "game_player"

    game_id = Column(Integer, ForeignKey("game.game_id"), primary_key=True)
    player_id = Column(Integer, ForeignKey("player.player_id"), primary_key=True)
    color = Column(String(10), nullable=False)
    result = Column(String(10), nullable=False)
