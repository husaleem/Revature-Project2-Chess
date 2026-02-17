from uuid import UUID
from sqlalchemy.exc import IntegrityError
from src.domain.exceptions import ValidationError
from src.domain.tournament import Tournament
from src.DTO.tournament_dto import (
    TournamentCreate,
    TournamentUpdate,
    TournamentParticipantRead,
)
from src.repositories.tournament_repository_protocol import TournamentRepositoryProtocol


def _map_participants(players) -> list[TournamentParticipantRead]:
    participant_list: list[TournamentParticipantRead] = []
    for player in players:
        participant_list.append(
            TournamentParticipantRead(
                player_id=player.player_id,
                first_name=player.first_name,
                last_name=player.last_name,
                rating=player.rating,
                wins=getattr(player, "wins", 0),
                losses=getattr(player, "losses", 0),
                draws=getattr(player, "draws", 0),
            )
        )
    return participant_list


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

    def get_participants_by_tournament_id(self, tournament_id: str):
        tournament = self.tournament_repo.get_tournament_by_id(tournament_id)
        if not tournament:
            raise ValueError(f"Tournament with id {tournament_id} not found.")

        players = self.tournament_repo.get_participants_by_tournament_id(tournament_id)
        if not players:
            raise ValueError(f"No participants found for tournament {tournament_id}.")
        return _map_participants(players)

    def get_participants_by_tournament_name(self, name: str):
        tournament = self.tournament_repo.get_tournament_by_name(name)
        if not tournament:
            raise ValueError(f"Tournament with name '{name}' not found.")

        players = self.tournament_repo.get_participants_by_tournament_name(name)
        if not players:
            raise ValueError(f"No participants found for tournament '{name}'.")
        return _map_participants(players)
