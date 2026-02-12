from datetime import datetime
from sqlalchemy.orm import Session
from src.repositories.game_repository_protocol import GameRepositoryProtocol
from src.domain.game import Game, WinState

class GameRepository(GameRepositoryProtocol):
    def __init__(self, session: Session):
        self.session = session

    def add_game(self, game: Game) -> str:
        self.session.add(game)
        self.session.commit()
        return f"Added game_id: {game.game_id}"

    def find_game_by_id(self, game_id: str) -> Game:
        game = self.session.get(Game, game_id)
        if not game:
            raise Exception("Book not found")
        self.session.commit()
        self.session.refresh(game)
        return game

    def get_all_games(self) -> list[Game]:
        return self.session.query(Game).all()

    def update_game_result(self, game_id: str, result: WinState) -> str:
        game = self.session.get(Game, game_id)
        if not game:
            raise Exception("Game not found")
        game.result = result
        self.session.commit()
        self.session.refresh(game)
        return f"Updated result in game_id: {game.game_id} to {result}"

    def update_game_tournament_id(self, game_id: str, new_tournament_id: str) -> str:
        game = self.session.get(Game, game_id)
        if not game:
            raise Exception("Game not found")
        game.tournament_id = new_tournament_id
        self.session.commit()
        self.session.refresh(game)
        return f"Updated tournament_id in game_id: {game.game_id} to {new_tournament_id}"

    def update_game_played_at(self, game_id: str, newDate: datetime) -> str:
        game = self.session.get(Game, game_id)
        if not game:
            raise Exception("Game not found")
        game.played_at = newDate
        self.session.commit()
        self.session.refresh(game)
        return f"Updated played_at in game_id: {game.game_id} to {newDate.isoformat()}"

    def delete_game_by_id(self, game_id: str) -> str:
        game = self.session.get(Game, game_id)
        if not game:
            raise Exception("Game not found")
        self.session.delete(game)
        self.session.commit()
        return f"Deleted game_id: {game.game_id}"
