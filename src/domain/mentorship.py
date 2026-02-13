from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from src.base import Base


class Mentorship(Base):
    __tablename__ = "mentors"

    player_id = Column(
        UUID(as_uuid=True), ForeignKey("players.player_id"), primary_key=True
    )
    mentor_id = Column(
        UUID(as_uuid=True), ForeignKey("players.player_id"), primary_key=True
    )

    def set_mentorship(self, player_id, mentor_id):
        self.player_id = player_id
        self.mentor_id = mentor_id
