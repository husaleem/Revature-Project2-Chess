from sqlalchemy.exc import IntegrityError
from src.domain.skill_level import SkillLevel
from src.DTO.skill_level_dto import SkillLevelCreate, SkillLevelUpdate
from src.repositories.skill_level_repository_protocol import SkillLevelRepositoryProtocol

class SkillLevelService:
    def __init__(self,
                 db,
                 skill_level_repo: SkillLevelRepositoryProtocol
        ):
        self.db = db
        self.skill_level_repo = skill_level_repo

    def get_all_skill_levels(self) -> list[SkillLevel]:
        return self.skill_level_repo.get_all_skill_levels()
    
    def get_skill_level_by_title(self, title: str) -> SkillLevel:
        skill_level = self.skill_level_repo.get_skill_level_by_title(title)
        
        if not skill_level:
            raise Exception(f'Skill level with title {title} not found.')
        
        return skill_level
    
    def add_skill_level(self, payload: SkillLevelCreate) -> str:
        self._validate_bounds(payload.rating_lower_bound, payload.rating_upper_bound)

        existing_skill = self.skill_level_repo.get_skill_level_by_title(payload.title)
        if existing_skill:
            raise Exception(f'Skill level with title {payload.title} already exists.')
        
        skill_level = SkillLevel(
            title=payload.title,
            rating_lower_bound=payload.rating_lower_bound,
            rating_upper_bound=payload.rating_upper_bound,
        )

        try:
            return self.skill_level_repo.add_skill_level(skill_level)
        except IntegrityError as e:
             raise Exception("Could not create skill level due to a database constraint.") from e

    def update_skill_level(self, title: str, payload: SkillLevelUpdate) -> SkillLevel:
        existing_skill = self.skill_level_repo.get_skill_level_by_title(title)
        if not existing_skill:
            raise Exception(f'Skill level with title {title} not found.')
        
        updates = payload.model_dump(exclude_unset=True)

        if not updates:
            return existing_skill
        
        if 'rating_lower_bound' in updates or 'rating_upper_bound' in updates:
            lower = updates.get('rating_lower_bound', existing_skill.rating_lower_bound)
            upper = updates.get('rating_upper_bound', existing_skill.rating_upper_bound)
            self._validate_bounds(lower, upper) 
        
        if "title" in updates and updates["title"] != existing_skill.title:
            new_title = updates["title"]
            conflict = self.skill_level_repo.get_skill_level_by_title(new_title)
            if conflict:
                raise Exception(f"Skill level with title '{new_title}' already exists.")
            
        for key, value in updates.items():
            setattr(existing_skill, key, value)

        try:
            return self.skill_level_repo.update_skill_level(existing_skill)
        except IntegrityError as e:
            raise Exception("Could not update skill level due to a database constraint.") from e
    
    def delete_skill_level(self, title: str) -> None:
        existing_skill = self.skill_level_repo.get_skill_level_by_title(title)
        if not existing_skill:
            raise Exception(f'Skill level with title {title} not found.')
        
        self.skill_level_repo.delete_skill_level(title)


    @staticmethod
    def _validate_bounds(lower: int, upper: int) -> None:
        if lower is None or upper is None:
            raise Exception("rating bounds are required.")

        if lower < 0 or upper < 0:
            raise Exception("rating bounds must be non-negative.")

        if lower > upper:
            raise Exception("rating_lower_bound must be less than or equal to rating_upper_bound.")
        
    
    def lookup_skill_level(self, player_id: str) -> dict:
        if not isinstance(player_id, str):
            raise ValueError("player_id must be a string")

        result = self.repo.lookup_skill_level_by_player_id(player_id)

        if not result:
            return {"message": "Skill level not found for player"}

        return {
            "player_id": result.player_id,
            "player_name": result.first_name,
            "skill_level": result.skill_level
        }