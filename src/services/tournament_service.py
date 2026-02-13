from uuid import UUID
from sqlalchemy.exc import IntegrityError
from src.domain.tournament import Tournament
from src.DTO.tournament_dto import TournamentCreate, TournamentUpdate
from src.repositories.tournament_repository_protocol import TournamentRepositoryProtocol

class TournamentService:
    def __init__(self,
                 db,
                 tournament_repo: TournamentRepositoryProtocol
        ):
        self.db = db
        self.tournament_repo = tournament_repo
        
    def get_all_tournaments(self) -> list[Tournament]:
        return self.tournament_repo.get_all_tournaments()
    
    def get_tournament_by_id(self, tournament_id: UUID) -> Tournament | None:
        tournament = self.tournament_repo.get_tournament_by_id(tournament_id)
        
        if not tournament:
            raise Exception(f'Tournament with id {tournament_id} not found.')
        
        return tournament
    
    def add_tournament(self, payload: TournamentCreate) -> str:
        ... # Validation logic can be added here