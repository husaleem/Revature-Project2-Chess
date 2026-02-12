from typing import Protocol
from src.domain.game import Game, WinState


class GameRepositoryProtocol(Protocol):
    #CRUD:

    #C
    def add_game(self, game: Game) -> str: ...

    #R
    def find_game_by_id(self, game_id: str) -> Game: ...
    def get_all_games(self) -> list[Game]: ...

    #U
    def update_game_result(self, game_id: str, result: WinState) -> Game: ...

    #D
    def delete_game_by_id(self, uuid: str) -> str: ...
