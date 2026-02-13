from uuid import UUID
from sqlalchemy.exc import IntegrityError
from src.domain.exceptions import ValidationError
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
    
    def get_tournament_by_id(self, tournament_id: UUID) -> Tournament:
        tournament = self.tournament_repo.get_tournament_by_id(tournament_id)
        
        if not tournament:
            raise Exception(f'Tournament with id {tournament_id} not found.')
        
        return tournament
    
    def add_tournament(self, payload: TournamentCreate) -> Tournament:
        tournament = Tournament(**payload.model_dump())
        try:
            return self.tournament_repo.add_tournament(tournament)
        except IntegrityError as e:
            raise ValidationError("Error adding tournament: invalid tournament data.") from e
        
    def update_tournament(self, tournament_id: UUID, payload: TournamentUpdate) -> Tournament:
        tournament = self.tournament_repo.get_tournament_by_id(tournament_id)
        
        if not tournament:
            raise Exception(f'Tournament with id {tournament_id} not found.')
        
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tournament, field, value)
            
        if tournament.end_date < tournament.start_date:
            raise Exception("End date cannot be before start date.")
        
        try:
            return self.tournament_repo.update_tournament(tournament)
        except IntegrityError as e:
            self.db.rollback()
            raise Exception("Error updating tournament: invalid tournament data.") from e
        
    def delete_tournament(self, tournament_id: UUID) -> None:
        try:
            tournament = self.tournament_repo.get_tournament_by_id(tournament_id)
            if not tournament:
                raise Exception(f"Tournament with id {tournament_id} not found.")

            self.tournament_repo.delete_tournament(tournament_id)

        except IntegrityError as e:
            self.db.rollback()
            raise Exception("Cannot delete tournament due to related records.") from e