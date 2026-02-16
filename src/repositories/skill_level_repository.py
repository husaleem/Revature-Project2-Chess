from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.domain.skill_level import SkillLevel
from src.repositories.skill_level_repository_protocol import SkillLevelRepositoryProtocol


class SkillLevelRepository(SkillLevelRepositoryProtocol):
    def __init__(self, session: Session):
        self.session = session

    def get_all_skill_levels(self) -> list[SkillLevel]:
        return self.session.query(SkillLevel).order_by(SkillLevel.rating_upper_bound.desc()).all()

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

        
    #more methods might be added...