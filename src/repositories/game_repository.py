from datetime import datetime, date
from sqlalchemy import func
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

    def find_games_by_played_date(self, played_date: date) -> list[Game]:
        return (
            self.session.query(Game)
            .filter(func.date(Game.played_at) == played_date)
            .all()
        )

    def find_games_by_result(self, result: WinState) -> list[Game]:
        return self.session.query(Game).filter(Game.result == result).all()

    def find_games_by_tournament_id(self, tournament_id: str) -> list[Game]:
        return self.session.query(Game).filter(Game.tournament_id == tournament_id).all()

    def update_game_result(self, game_id: str, result: WinState) -> Game:
        game = self.session.get(Game, game_id)
        if not game:
            raise Exception("Game not found")
        game.result = result
        self.session.commit()
        self.session.refresh(game)
        return game

    def update_game_tournament_id(self, game_id: str, new_tournament_id: str) -> Game:
        game = self.session.get(Game, game_id)
        if not game:
            raise Exception("Game not found")
        game.tournament_id = new_tournament_id
        self.session.commit()
        self.session.refresh(game)
        return game

    def update_game_played_at(self, game_id: str, newDate: datetime) -> Game:
        game = self.session.get(Game, game_id)
        if not game:
            raise Exception("Game not found")
        game.played_at = newDate
        self.session.commit()
        self.session.refresh(game)
        return game

    def delete_game_by_id(self, game_id: str) -> str:
        game = self.session.get(Game, game_id)
        if not game:
            raise Exception("Game not found")
        self.session.delete(game)
        self.session.commit()
        return f"Deleted game_id: {game.game_id}"
