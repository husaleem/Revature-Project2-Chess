from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from src.domain.skill_level import SkillLevel
from src.repositories.skill_level_repository_protocol import SkillLevelRepositoryProtocol


class SkillLevelRepository(SkillLevelRepositoryProtocol):
    def __init__(self, session: Session):
        self.session = session

    def get_all_skill_levels(self) -> list[SkillLevel]:
        return self.session.query(SkillLevel).all()

    def get_skill_level_by_title(self, title: str) -> SkillLevel | None:
        # You can also do: return self.session.get(SkillLevel, title)
        return self.session.query(SkillLevel).filter(SkillLevel.title == title).first()

    def add_skill_level(self, skill_level: SkillLevel) -> str:
        try:
            self.session.add(skill_level)
            self.session.commit()
            return str(skill_level.title)
        except IntegrityError:
            self.session.rollback()
            raise Exception(f"Skill level with title {skill_level.title} already exists.")

    def update_skill_level(self, skill_level: SkillLevel) -> SkillLevel:
        try:
            self.session.commit()
            self.session.refresh(skill_level)
            return skill_level
        except:
            self.session.rollback()
            raise Exception("Could not update skill level due to a database constraint.")

    def delete_skill_level(self, title: str) -> None:
        try:
            skill_level = self.session.get(SkillLevel, title)
            self.session.delete(skill_level)
            self.session.commit()
        except:
            self.session.rollback()
            raise Exception("Could not delete skill level due to a database constraint.")

        
    #Lookup skill level by player id (Business Model)
    def lookup_skill_level_by_player_id(self, player_id: str):
        query = text("""
        SELECT 
            p.player_id,
            p.first_name,
            s.title AS skill_level
        FROM player p
        INNER JOIN skill_level s
            ON p.rating BETWEEN s.rating_lower AND s.rating_upper
        WHERE p.player_id = :player_id
        """)

        return self.session.execute(
            query,
            {"player_id": player_id}
        ).fetchone()