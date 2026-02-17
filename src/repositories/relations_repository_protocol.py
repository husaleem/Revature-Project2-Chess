from typing import Protocol

from src.DTO.player_match_history import PlayerMatchHistoryRead
from src.domain import Game
from src.domain.player import Player

class RelationsRepositoryProtocol(Protocol):
    def get_player_summary_by_id(self, player_id: str): ...

    def get_top_players(self) -> list[Player]: ...

    def get_player_match_history(self, player_id: str) -> PlayerMatchHistoryRead: ...