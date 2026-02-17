import uuid
from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID
from src.base import Base


class Player(Base):
    __tablename__ = "players"

    # Primary Key
    player_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Other Attributes
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)

    def set_first_name(self, new_name: str):
        self.first_name = new_name

    def set_last_name(self, new_name: str):
        self.last_name = new_name

    def set_rating(self, new_rating: int):
        self.rating = new_rating

    def set_rating_by_increment(self, rating_increment: int):
        self.rating += rating_increment
