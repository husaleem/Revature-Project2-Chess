from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, or_, and_, case
from sqlalchemy.sql.functions import count

from src.DTO.player_match_history import PlayerMatchHistoryRead
from src.DTO.game import GameRead
from src.domain.player import Player
from src.domain.game import Game, WinState
from src.domain.skill_level import SkillLevel
from src.repositories.relations_repository_protocol import RelationsRepositoryProtocol
from src.repositories.helpers import player_stats


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

    # Returns win/loss ratio, draw percentage, average opponent rating, and the most common opponent
    def get_top_players(self):
        wins, losses, draws = player_stats()

        opponent = aliased(Player)
        opponent_condition = or_(
            and_(
                Player.player_id == Game.player_white_id,
                opponent.player_id == Game.player_black_id,
            ),
            and_(
                Player.player_id == Game.player_black_id,
                opponent.player_id == Game.player_white_id,
            ),
        )

        result = (
            self.session.query(
                Player,
                wins,
                losses,
                draws,
                func.avg(opponent.rating).label("avgOppRating"),
            )
            .join(
                Game,
                or_(
                    Player.player_id == Game.player_white_id,
                    Player.player_id == Game.player_black_id,
                ),
            )
            .join(opponent, opponent_condition)
            .group_by(Player.player_id)
            .order_by(Player.rating.desc())
        )

        players: list[Player] = []
        for player, win_count, loss_count, draw_count, avg_rating in result:
            total_played = win_count + loss_count + draw_count
            player.winLoss = (win_count / loss_count) if loss_count else win_count
            player.drawPercent = (draw_count / total_played) if total_played else 0.0
            player.avgOppRating = float(avg_rating) if avg_rating is not None else None
            players.append(player)

        return players

    #SELECT * FROM games JOIN players ON player_id = player_id
    def get_player_match_history(self, player_id: str):
        rows = (
            self.session.query(
            Player.player_id, Player.first_name, Player.last_name, Game
        ).join(Game,
               or_(
                   Player.player_id == Game.player_white_id,
                   Player.player_id == Game.player_black_id,
               ),
               ).filter(Player.player_id == player_id).all()
                )
        if not rows:
            return None

        player_id, first_name, last_name = rows[0][:3]
        history = [GameRead.model_validate(row[3]) for row in rows]

        return PlayerMatchHistoryRead(
            player_id=player_id,
            first_name=first_name,
            last_name=last_name,
            match_history=history,
        )