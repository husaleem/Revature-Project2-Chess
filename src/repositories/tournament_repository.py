from typing import Any
from uuid import UUID
from sqlalchemy import func, case, or_, and_, Label
from sqlalchemy.orm import Session
from src.domain.tournament import Tournament
from src.domain.player import Player
from src.domain.game import Game, WinState
from src.repositories.tournament_repository_protocol import TournamentRepositoryProtocol


def player_stats() -> tuple[Label[Any], Label[Any], Label[Any]]:
    is_white = Game.player_white_id == Player.player_id
    is_black = Game.player_black_id == Player.player_id
    participated = or_(is_white, is_black)

    white_win = Game.result == WinState.WHITE_WIN
    black_win = Game.result == WinState.BLACK_WIN

    won_as_white = and_(is_white, white_win)
    won_as_black = and_(is_black, black_win)
    lost_as_white = and_(is_white, black_win)
    lost_as_black = and_(is_black, white_win)
    draw_as_any = and_(participated, Game.result == WinState.DRAW)

    wins = func.sum(
        case((won_as_white, 1),
             (won_as_black, 1),
             else_=0)
    ).label("wins")

    losses = func.sum(
        case((lost_as_white, 1),
             (lost_as_black, 1),
             else_=0)
    ).label("losses")

    draws = func.sum(
        case((draw_as_any, 1), else_=0)
    ).label("draws")
    return draws, losses, wins


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


        wins, losses ,draws = player_stats()

        results = (
            self.session.query(
                Player,
                wins,
                losses,
                draws
            )
            .join(Game, or_(Game.player_white_id == Player.player_id,Game.player_black_id == Player.player_id))
            .filter(Game.tournament_id == tournament_id)
            .group_by(Player.player_id, Player.first_name, Player.last_name, Player.rating)
            .all()
        )
        return results




    def get_participants_by_tournament_name(self, name: str):
        tournament = self.get_tournament_by_name(name)
        if tournament is None:
            return []
        return self.get_participants_by_tournament_id(tournament.tournament_id)

    #more methods might be added...
