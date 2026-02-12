from sqlalchemy import Column, String, Integer, CheckConstraint
from src.base import Base

class SkillLevel(Base):
    #table
    __tablename__ = 'skill_level'
    
    #primary key
    title = Column(String, primary_key=True)
    
    #Required fields
    rating_lower_bound = Column(Integer, nullable=False)
    rating_upper_bound = Column(Integer, nullable=False)
    
        # Table-level constraints
    __table_args__ = (
        CheckConstraint("rating_lower >= 0", name="ck_skill_lower_nonnegative"),
        CheckConstraint("rating_upper >= 0", name="ck_skill_upper_nonnegative"),
        CheckConstraint("rating_lower <= rating_upper", name="ck_skill_valid_range"),
    )
    
    
    def __repr__(self):
        return f"<SkillLevel {self.title} ({self.rating_lower_bound}-{self.rating_upper_bound})>"