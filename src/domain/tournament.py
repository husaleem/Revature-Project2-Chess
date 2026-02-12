import uuid
from sqlalchemy import Column, String, Date, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from src.base import Base

class Tournament(Base):
    #table
    __tablename__ = 'tournaments'
    
    #primary key
    tournament_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    #Required fields
    name = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    location = Column(String, nullable=False)
    
    # Constraint: end_date must be >= start_date
    #__table_args__ is a special attribute in SQLAlchemy (allows u to put table-level rules/constraints)
    __table_args__ = (
        CheckConstraint("end_date >= start_date", name="ck_tournament_valid_dates"),
    )

    #this purely for debgging and printing the object in a readable format, not used by SQLAlchemy for anything
    def __repr__(self):
        return f"<Tournament {self.name} ({self.location})>"