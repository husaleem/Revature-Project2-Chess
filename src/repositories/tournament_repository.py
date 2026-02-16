from uuid import UUID
from sqlalchemy import func, case, or_, and_
from sqlalchemy.orm import Session
from src.domain.tournament import Tournament
from src.domain.player import Player
from src.domain.game import Game, WinState
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

    def get_participants_by_tournament_id(self, tournament_id: str):
        is_white = Game.player_white_id == Player.player_id
        is_black = Game.player_black_id == Player.player_id

        wins = func.sum(
            case((and_(is_white, Game.result == WinState.WHITE_WIN), 1),
            (and_(is_black, Game.result == WinState.BLACK_WIN), 1),
            else_=0
        )
        ).label("wins")

        losses = func.sum(
            case((and_(is_white, Game.result == WinState.BLACK_WIN), 1),
            (and_(is_black, Game.result == WinState.WHITE_WIN), 1),
            else_=0
        )
        ).label("losses")

        draws = func.sum(
            case((and_(or_(is_white, is_black), Game.result == WinState.DRAW), 1),
            else_=0
        )
        ).label("draws")

        results = (
            self.session.query(
                Player.player_id,
                Player.first_name,
                Player.last_name,
                Player.rating,
                wins,
                losses,
                draws
            )
            .join(Game, or_(Game.player_white_id == Player.player_id,Game.player_black_id == Player.player_id))
            .filter(Game.tournament_id == tournament_id)
            .group_by(Player.player_id, Player.first_name, Player.last_name, Player.rating)
            .all()
        )

        return [
            {
                "player_id": str(row.player_id),
                "first_name": row.first_name,
                "last_name": row.last_name,
                "rating": row.rating,
                "wins": int(row.wins or 0),
                "losses": int(row.losses or 0),
                "draws": int(row.draws or 0)
            }
            for row in results
        ]

    def get_participants_by_tournament_name(self, name: str):
        tournament = self.get_tournament_by_name(name)
        if tournament is None:
            return []
        return self.get_participants_by_tournament_id(tournament.tournament_id)

    #more methods might be added...
