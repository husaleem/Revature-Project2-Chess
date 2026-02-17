from typing import Protocol
from uuid import UUID
from src.domain.tournament import Tournament


class TournamentRepositoryProtocol(Protocol):
    def get_all_tournaments(self) -> list[Tournament]:
        ...
        
    def get_tournament_by_id(self, tournament_id: UUID) -> Tournament | None:
        ...
        
    def get_tournament_by_name(self, name: str) -> Tournament | None:
        ...

    def add_tournament(self, tournament: Tournament) -> str:
        ...
        
    def update_tournament(self, tournament: Tournament) -> Tournament:
        ... 
    
    def delete_tournament(self, tournament_id: UUID) -> None:
        ...

    def get_participants_by_tournament_id(self, tournament_id: str): ...

    def get_participants_by_tournament_name(self, name: str): ...
    #Might add if I have more time
        
    #def get_tournaments_by_player_id(self, player_id: UUID) -> list[Tournament]:
    #def add_seed_records(self, tournaments: List[Tournament]) -> None: