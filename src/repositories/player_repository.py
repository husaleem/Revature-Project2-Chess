from sqlalchemy.orm import Session
from src.domain.player import Player
from src.repositories.player_repository_protocol import PlayerRepositoryProtocol


class PlayerRepository(PlayerRepositoryProtocol):
    def __init__(self, session: Session):
        self.session = session

    # -- Create Operations --
    def add(self, player: Player) -> str:
        self.session.add(player)
        self.session.commit()
        return str(player.player_id)

    # -- Read Operations --
    def get_all(self) -> list[Player]:
        return self.session.query(Player).all()

    def get_by_first_name(self, first_name: str) -> list[Player]:
        return self.session.query(Player).filter(Player.first_name == first_name).all()

    def get_by_last_name(self, last_name: str) -> list[Player]:
        return self.session.query(Player).filter(Player.last_name == last_name).all()

    def get_by_full_name(self, first_name: str, last_name: str) -> list[Player]:
        return (
            self.session.query(Player)
            .filter(Player.first_name == first_name and Player.last_name == last_name)
            .all()
        )

    def get_by_rating(self, rating: int) -> list[Player]:
        return self.session.query(Player).filter(Player.rating == rating).all()

    def get_by_rating_range(self, rating_lower: int, rating_upper: int) -> list[Player]:
        return (
            self.session.query(Player)
            .filter(Player.rating >= rating_lower and Player.rating < rating_upper)
            .all()
        )

    def get_by_id(self, player_id: str) -> Player:
        return (
            self.session.query(Player)
            .filter(Player.player_id == player_id)
            .one_or_none()
        )

    # -- Update Operations --
    def update_first_name_by_id(self, player_id: str, first_name: str) -> Player:
        player = self.session.get(Player, player_id)
        if not player:
            raise Exception("Player not found")
        player.set_first_name(first_name)
        self.session.commit()
        self.session.refresh()
        return player

    def update_last_name_by_id(self, player_id: str, last_name: str) -> Player:
        player = self.session.get(Player, player_id)
        if not player:
            raise Exception("Player not found")
        player.set_last_name(last_name)
        self.session.commit()
        self.session.refresh()
        return player

    def update_full_name_by_id(
        self, player_id: str, first_name: str, last_name: str
    ) -> Player:
        player = self.session.get(Player, player_id)
        if not player:
            raise Exception("Player not found")
        player.set_first_name(first_name)
        player.set_last_name(last_name)
        self.session.commit()
        self.session.refresh()
        return player

    def update_rating_by_id(self, player_id: str, rating: int) -> Player:
        player = self.session.get(Player, player_id)
        if not player:
            raise Exception("Player not found")
        player.set_rating(rating)
        self.session.commit()
        self.session.refresh()
        return player

    # -- Delete Operations --
    def delete_by_id(self, player_id: str) -> Player:
        player = self.session.get(Player, player_id)
        if not player:
            raise Exception("Player not found")
        self.session.delete(player)
        self.session.commit()
        self.session.refresh()
        return player
