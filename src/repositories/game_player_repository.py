from sqlalchemy.orm import Session
from src.domain.game_player import GamePlayer

class GamePlayerRepository:

    def create(self, db: Session, game_player: GamePlayer):
        db.add(game_player)
        db.commit()
        db.refresh(game_player)
        return game_player

    def get_all(self, db: Session):
        return db.query(GamePlayer).all()

    def get_by_ids(self, db: Session, game_id: int, player_id: int):
        return db.query(GamePlayer).filter(
            GamePlayer.game_id == game_id,
            GamePlayer.player_id == player_id
        ).first()

    def delete(self, db: Session, game_id: int, player_id: int):
        gp = self.get_by_ids(db, game_id, player_id)
        if gp:
            db.delete(gp)
            db.commit()
        return gp
