from src.repositories.game_repository_protocol import GameRepositoryProtocol
from src.domain.game import Game, WinState
from datetime import datetime


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

    def update_game_result(self, game_id: str, result: WinState) -> str:
        if not (isinstance(game_id, str) or isinstance(result, WinState)):
            raise ValueError(f"Expected type (str, WinState), but received ({type(game_id)}, {type(result)})")
        return self.repo.update_game_result(game_id, result)

    def update_game_tournament_id(self, game_id: str, new_tournament_id: str) -> str:
        if not (isinstance(game_id, str) or isinstance(new_tournament_id, str)):
            raise ValueError(f"Expected type (str, str), but received ({type(game_id)}, {type(new_tournament_id)})")
        return self.repo.update_game_tournament_id(game_id, new_tournament_id)

    def update_game_played_at(self, game_id: str, newDate: datetime) -> str:
        if not (isinstance(game_id, str) or isinstance(newDate, datetime)):
            raise ValueError(f"Expected type (str, WinState), but received ({type(game_id)}, {type(newDate)})")
        return self.repo.update_game_played_at(game_id, newDate)

    def delete_game_by_id(self, game_id: str) -> str:
        if not isinstance(game_id, str):
            raise ValueError(f"Expected type (str), but received ({type(game_id)})")
        return self.repo.delete_game_by_id(game_id)