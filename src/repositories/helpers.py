from typing import Any, NamedTuple

from sqlalchemy import Label, or_, and_, func, case

from src.domain.game import Game, WinState
from src.domain.player import Player


class PlayerParticipationExpressions(NamedTuple):
    is_white: Any
    is_black: Any
    participated: Any
    won_as_white: Any
    won_as_black: Any
    lost_as_white: Any
    lost_as_black: Any
    draw_as_any: Any


def player_participation_expressions() -> PlayerParticipationExpressions:
    """Build fresh SQL predicates describing a player's role in a game."""
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

    return PlayerParticipationExpressions(
        is_white=is_white,
        is_black=is_black,
        participated=participated,
        won_as_white=won_as_white,
        won_as_black=won_as_black,
        lost_as_white=lost_as_white,
        lost_as_black=lost_as_black,
        draw_as_any=draw_as_any,
    )


def player_stats() -> tuple[Label[Any], Label[Any], Label[Any]]:
    """Aggregate wins, losses, and draws for the currently selected player."""
    expressions = player_participation_expressions()

    wins = func.sum(
        case(
            (expressions.won_as_white, 1),
            (expressions.won_as_black, 1),
            else_=0,
        )
    ).label("wins")

    losses = func.sum(
        case(
            (expressions.lost_as_white, 1),
            (expressions.lost_as_black, 1),
            else_=0,
        )
    ).label("losses")

    draws = func.sum(
        case((expressions.draw_as_any, 1), else_=0)
    ).label("draws")

    return wins, losses, draws
