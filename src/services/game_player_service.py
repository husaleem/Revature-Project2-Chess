from sqlalchemy.orm import Session
from src.repositories.game_player_repository import GamePlayerRepository
from src.domain.game_player import GamePlayer
from src.DTO.game_player import GamePlayerCreate

class GamePlayerService:

    def __init__(self):
        self.repo = GamePlayerRepository()

    def create_game_player(self, db: Session, dto: GamePlayerCreate):
        gp = GamePlayer(**dto.dict())
        return self.repo.create(db, gp)

    def get_all_game_players(self, db: Session):
        return self.repo.get_all(db)

    def delete_game_player(self, db: Session, game_id: int, player_id: int):
        return self.repo.delete(db, game_id, player_id)
