from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_, case
from sqlalchemy.sql.functions import count
from src.domain.player import Player
from src.domain.game import Game, WinState
from src.domain.skill_level import SkillLevel
from src.repositories.relations_repository_protocol import RelationsRepositoryProtocol


class RelationsRepository(RelationsRepositoryProtocol):
    def __init__(self, session: Session):
        self.session = session

    def get_player_summary_by_id(self, player_id: str):
        query = (
            self.session.query(
                Player.first_name,
                Player.last_name,
                Player.rating,
                SkillLevel.title,
                count(Game.game_id).label("total_games"),
                (
                    func.sum(
                        case(
                            # Condition 1: Player was white AND white won
                            (
                                and_(
                                    Player.player_id == Game.player_white_id,
                                    Game.result == WinState.WHITE_WIN,
                                ),
                                1,
                            ),
                            # Condition 2: Player was black AND black won
                            (
                                and_(
                                    Player.player_id == Game.player_black_id,
                                    Game.result == WinState.BLACK_WIN,
                                ),
                                1,
                            ),
                            # Condition 3: Draw
                            (Game.result == WinState.DRAW, 0.5),
                            else_=0,
                        )
                    )
                    * 100.0
                    / func.nullif(count(Game.game_id), 0)
                ).label("win_rate"),
            )
            .join(
                Game,
                or_(
                    Player.player_id == Game.player_white_id,
                    Player.player_id == Game.player_black_id,
                ),
            )
            .join(
                SkillLevel,
                and_(
                    Player.rating >= SkillLevel.rating_lower_bound,
                    Player.rating <= SkillLevel.rating_upper_bound,
                ),
            )
            .filter(Player.player_id == player_id)
            .group_by(
                Player.player_id, Player.first_name, Player.last_name, SkillLevel.title
            )
        )

        return query.first()
