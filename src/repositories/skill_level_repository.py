from sqlalchemy.orm import Session

from src.domain.skill_level import SkillLevel
from src.repositories.skill_level_repository_protocol import SkillLevelRepositoryProtocol


class SQLSkillLevelRepository(SkillLevelRepositoryProtocol):
    def __init__(self, session: Session):
        self.session = session

    def get_all_skill_levels(self) -> list[SkillLevel]:
        return self.session.query(SkillLevel).all()

    def get_skill_level_by_title(self, title: str) -> SkillLevel | None:
        # You can also do: return self.session.get(SkillLevel, title)
        return self.session.query(SkillLevel).filter(SkillLevel.title == title).first()

    def add_skill_level(self, skill_level: SkillLevel) -> str:
        self.session.add(skill_level)
        self.session.commit()
        return str(skill_level.title)

    def update_skill_level(self, skill_level: SkillLevel) -> SkillLevel:
        self.session.commit()
        self.session.refresh(skill_level)
        return skill_level

    def delete_skill_level(self, title: str) -> None:
        skill_level = self.session.get(SkillLevel, title)
        if not skill_level:
            raise Exception("Skill level not found.")
        self.session.delete(skill_level)
        self.session.commit()

        
    #more methods might be added...