from uuid import UUID
from sqlalchemy.orm import Session
from src.domain.tournament import Tournament
from src.repositories.tournament_repository_protocol import TournamentRepositoryProtocol


class TournamentRepository(TournamentRepositoryProtocol):
    def __init__(self, session: Session):
        self.session = session
        
    def get_all_tournaments(self) -> list[Tournament]:
        return self.session.query(Tournament).all()
    
    def get_tournament_by_id(self, tournament_id: UUID) -> Tournament | None:
        return self.session.get(Tournament, tournament_id)

    def get_tournament_by_name(self, name: str) -> Tournament | None:
        return self.session.get(Tournament, name)
    
    def add_tournament(self, tournament: Tournament) -> Tournament:
        try:
            self.session.add(tournament)
            self.session.commit()
            self.session.refresh(tournament)
            return tournament
        except Exception:
            self.session.rollback()
            raise Exception("Error adding tournament: invalid tournament data.")
    
    def update_tournament(self, tournament: Tournament) -> Tournament:
        self.session.commit()
        self.session.refresh(tournament)
        return tournament
        
    def delete_tournament(self, tournament_id: UUID) -> None:
        tournament = self.session.get(Tournament, tournament_id)
        self.session.delete(tournament)
        self.session.commit()
        
    #more methods might be added...
    