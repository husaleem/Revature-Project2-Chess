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
    
    #def get_tournament_by_id(self, tournament_id: UUID) -> Tournament | None:
        