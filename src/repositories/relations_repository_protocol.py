from typing import Protocol

from src.domain.player import Player

class RelationsRepositoryProtocol(Protocol):
    def get_player_summary_by_id(self, player_id: str): ...

    def get_top_players(self) -> list[Player]: ...
