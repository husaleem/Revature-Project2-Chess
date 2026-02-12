from src.repositories.game_repository_protocol import GameRepositoryProtocol
from src.domain.game import Game, WinState
from datetime import datetime, date


class GameService:
    def __init__(self, repo: GameRepositoryProtocol):
        self.repo = repo

    def add_game(self, game: Game) -> str:
        if not isinstance(game, Game):
            raise ValueError(f"Expected type (Game), but received ({type(game)})")
        return self.repo.add_game(game)

    def find_game_by_id(self, game_id: str) -> Game:
        if not isinstance(game_id, str):
            raise ValueError(f"Expected type (str), but received ({type(game_id)})")
        return self.repo.find_game_by_id(game_id)

    def get_all_games(self) -> list[Game]:
        return self.repo.get_all_games()

    def find_games_by_played_date(self, played_date: date) -> list[Game]:
        if not isinstance(played_date, date):
            raise ValueError(f"Expected type (date), but received ({type(played_date)})")
        return self.repo.find_games_by_played_date(played_date)

    def find_games_by_result(self, result: WinState) -> list[Game]:
        if not isinstance(result, WinState):
            raise ValueError(f"Expected type (WinState), but received ({type(result)})")
        return self.repo.find_games_by_result(result)

    def find_games_by_tournament_id(self, tournament_id: str) -> list[Game]:
        if not isinstance(tournament_id, str):
            raise ValueError(f"Expected type (str), but received ({type(tournament_id)})")
        return self.repo.find_games_by_tournament_id(tournament_id)

    def update_game_result(self, game_id: str, result: WinState) -> Game:
        if not isinstance(game_id, str):
            raise ValueError(f"Expected type (str) for game_id, but received ({type(game_id)})")
        if not isinstance(result, WinState):
            raise ValueError(f"Expected type (WinState) for result, but received ({type(result)})")
        return self.repo.update_game_result(game_id, result)

    def update_game_tournament_id(self, game_id: str, new_tournament_id: str) -> Game:
        if not isinstance(game_id, str):
            raise ValueError(f"Expected type (str) for game_id, but received ({type(game_id)})")
        if not isinstance(new_tournament_id, str):
            raise ValueError(f"Expected type (str) for new_tournament_id, but received ({type(new_tournament_id)})")
        return self.repo.update_game_tournament_id(game_id, new_tournament_id)

    def update_game_played_at(self, game_id: str, newDate: datetime) -> Game:
        if not isinstance(game_id, str):
            raise ValueError(f"Expected type (str) for game_id, but received ({type(game_id)})")
        if not isinstance(newDate, datetime):
            raise ValueError(f"Expected type (datetime) for newDate, but received ({type(newDate)})")
        return self.repo.update_game_played_at(game_id, newDate)

    def delete_game_by_id(self, game_id: str) -> str:
        if not isinstance(game_id, str):
            raise ValueError(f"Expected type (str), but received ({type(game_id)})")
        return self.repo.delete_game_by_id(game_id)