import uuid
from sqlalchemy import Column, String, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from src.base import Base


class Violation(Base):
    __tablename__ = "violations"

    # Primary Key
    violation_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign Keys
    player_id = Column(
        UUID(as_uuid=True),
        ForeignKey("players.player_id"),
        nullable=False,
    )

    # MUST match current Game table name in main ("books")
    game_id = Column(
        UUID(as_uuid=True),
        ForeignKey("games.game_id"),
        nullable=False,
    )

    # Other fields
    violation_type = Column(String, nullable=False)
    violation_date = Column(TIMESTAMP(timezone=True), nullable=False)
    consequence = Column(String, nullable=True)

    def set_violation_type(self, new_type: str):
        self.violation_type = new_type

    def set_violation_date(self, new_date):
        self.violation_date = new_date

    def set_consequence(self, new_consequence: str | None):
        self.consequence = new_consequence