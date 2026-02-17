from src.repositories.player_repository_protocol import PlayerRepositoryProtocol
from src.domain.player import Player
from src.domain.game import Game, WinState


class PlayerService:
    def __init__(self, repo: PlayerRepositoryProtocol):
        self.repo = repo

    def add(self, player: Player) -> str:
        if not isinstance(player, Player):
            raise ValueError(f"Expected type (Player), but received ({type(player)})")
        return self.repo.add(player)

    def get_all(self) -> list[Player]:
        return self.repo.get_all()

    def get_by_first_name(self, first_name: str) -> list[Player]:
        if not isinstance(first_name, str):
            raise ValueError(f"Expected type (str), but received ({type(first_name)})")
        return self.repo.get_by_first_name(first_name)

    def get_by_last_name(self, last_name: str) -> list[Player]:
        if not isinstance(last_name, str):
            raise ValueError(f"Expected type (str), but received ({type(last_name)})")
        return self.repo.get_by_last_name(last_name)

    def get_by_full_name(self, first_name: str, last_name: str) -> list[Player]:
        if not (isinstance(first_name, str) or isinstance(last_name, str)):
            raise ValueError(
                f"Expected type (str, str), but received ({type(first_name)}, {type(last_name)})"
            )
        return self.repo.get_by_full_name(first_name, last_name)

    def get_by_rating(self, rating: int) -> list[Player]:
        if not isinstance(rating, int):
            raise ValueError(f"Expected type (int), but received ({type(rating)})")
        return self.repo.get_by_rating(rating)

    def get_by_rating_range(self, rating_lower: int, rating_upper: int) -> list[Player]:
        if not (isinstance(rating_lower, int) or isinstance(rating_upper, int)):
            raise ValueError(
                f"Expected type (int, int), but received ({type(rating_lower)}, {type(rating_upper)})"
            )
        return self.repo.get_by_rating_range(rating_lower, rating_upper)

    def get_by_id(self, player_id: str) -> Player:
        if not isinstance(player_id, str):
            raise ValueError(f"Expected type (str), but received ({type(player_id)})")
        return self.repo.get_by_id(player_id)

    def update_first_name_by_id(self, player_id: str, first_name: str) -> Player:
        if not (isinstance(player_id, str) or isinstance(first_name, str)):
            raise ValueError(
                f"Expected type (str, str), but received ({type(player_id)}, {type(first_name)})"
            )
        return self.repo.update_first_name_by_id(player_id, first_name)

    def update_last_name_by_id(self, player_id: str, last_name: str) -> Player:
        if not (isinstance(player_id, str) or isinstance(last_name, str)):
            raise ValueError(
                f"Expected type (str, str), but received ({type(player_id)}, {type(last_name)})"
            )
        return self.repo.update_last_name_by_id(player_id, last_name)

    def update_full_name_by_id(
        self, player_id: str, first_name: str, last_name: str
    ) -> Player:
        if not (
            isinstance(player_id, str)
            or isinstance(first_name, str)
            or isinstance(last_name, str)
        ):
            raise ValueError(
                f"Expected type (str, str, str), but received ({type(player_id)}, {type(first_name)}, {type(last_name)})"
            )
        return self.repo.update_full_name_by_id(player_id, first_name, last_name)

    def update_rating_by_id(self, player_id: str, rating: int) -> Player:
        if not (isinstance(player_id, str) or isinstance(rating, int)):
            raise ValueError(
                f"Expected type (str, int), but received ({type(player_id)}, {type(rating)})"
            )
        return self.repo.update_rating_by_id(player_id, rating)

    def update_rating_via_increment_by_id(
        self, player_id: str, rating_increment: int
    ) -> Player:
        if not (isinstance(player_id, str) or isinstance(rating_increment, int)):
            raise ValueError(
                f"Expected type (str, int), but received ({type(player_id)}, {type({rating_increment})})"
            )
        return self.repo.update_rating_via_increment_by_id(player_id, rating_increment)

    def update_players_on_game_insert(self, game: Game):
        if not (isinstance(game, Game)):
            raise ValueError(f"Expected type (Game), but received {type(Game)})")
        loss_change = -9
        win_change = 10
        draw_change = 1
        match game.result:
            case WinState.WHITE_WIN:
                self.repo.update_rating_via_increment_by_id(
                    game.player_white_id, win_change
                )
                self.repo.update_rating_via_increment_by_id(
                    game.player_black_id, loss_change
                )
            case WinState.BLACK_WIN:
                self.repo.update_rating_via_increment_by_id(
                    game.player_white_id, loss_change
                )
                self.repo.update_rating_via_increment_by_id(
                    game.player_black_id, win_change
                )
            case WinState.DRAW:
                self.repo.update_rating_via_increment_by_id(
                    game.player_white_id, draw_change
                )
                self.repo.update_rating_via_increment_by_id(
                    game.player_black_id, draw_change
                )

    def delete_by_id(self, player_id: str) -> Player:
        if not (isinstance(player_id, str)):
            raise ValueError(f"Expected type (str), but received ({type(player_id)})")
        return self.repo.delete_by_id(player_id)
