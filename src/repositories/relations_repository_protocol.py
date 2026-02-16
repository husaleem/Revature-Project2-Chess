from typing import Protocol

class RelationsRepositoryProtocol(Protocol):
    def get_player_summary_by_id(self, player_id: str): ...
