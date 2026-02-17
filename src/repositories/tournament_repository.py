from uuid import UUID
from sqlalchemy import or_
from sqlalchemy.orm import Session
from src.domain.tournament import Tournament
from src.domain.player import Player
from src.domain.game import Game
from src.repositories.helpers import player_stats
from src.repositories.tournament_repository_protocol import TournamentRepositoryProtocol


class TournamentRepository(TournamentRepositoryProtocol):
    def __init__(self, session: Session):
        self.session = session
        
    def get_all_tournaments(self) -> list[Tournament]:
        return self.session.query(Tournament).all()
    
    def get_tournament_by_id(self, tournament_id: str) -> Tournament | None:
        return self.session.get(Tournament, tournament_id)

    def get_tournament_by_name(self, name: str) -> Tournament | None:
        return (
            self.session.query(Tournament)
            .filter(Tournament.name == name)
            .one_or_none()
        )

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

    def get_participants_by_tournament_id(self, tournament_id: str):
        wins, losses, draws = player_stats()

        results = (
            self.session.query(
                Player,
                wins,
                losses,
                draws
            )
            .join(Game, or_(Game.player_white_id == Player.player_id, Game.player_black_id == Player.player_id))
            .filter(Game.tournament_id == tournament_id)
            .group_by(Player.player_id, Player.first_name, Player.last_name, Player.rating)
            .all()
        )

        players: list[Player] = []
        for player, wins_value, losses_value, draws_value in results:
            player.wins = int(wins_value or 0)
            player.losses = int(losses_value or 0)
            player.draws = int(draws_value or 0)
            players.append(player)
        return players

    def get_participants_by_tournament_name(self, name: str):
        tournament = self.get_tournament_by_name(name)
        if tournament is None:
            return []
        return self.get_participants_by_tournament_id(tournament.tournament_id)

    #more methods might be added...
