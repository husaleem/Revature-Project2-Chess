from src.repositories.relations_repository_protocol import RelationsRepositoryProtocol
from src.DTO.top_players_stats import PlayerTopStatsResponseRead


class RelationsService:
    def __init__(self, repo: RelationsRepositoryProtocol):
        self.repo = repo

    def get_player_summary_by_id(self, player_id: str):
        if not isinstance(player_id, str):
            raise ValueError(f"Expected type (str), but received ({type(player_id)})")
        return self.repo.get_player_summary_by_id(player_id)

    def get_top_players(self):
        return self.repo.get_top_players()
