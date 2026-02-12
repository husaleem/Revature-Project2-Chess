from typing import Protocol
from src.domain.skill_level import SkillLevel

class SkillLevelRepositoryProtocol(Protocol):
    def get_all_skill_levels(self) -> list[SkillLevel]:
        ...
        
    def get_skill_level_by_title(self, skill_level_title: str) -> SkillLevel:
        ...
        
    def add_skill_level(self, skill_level: SkillLevel) -> str:
        ...
        
    def update_skill_level(self, skill_level: SkillLevel) -> SkillLevel:
        ... 
    
    def delete_skill_level(self, skill_level_id: int) -> None:
        ...
        
    #Could add if I have more time
    #def get_skill_levels_by_player_id(self, player_id: int) -> list[SkillLevel]:
    #def add_seed_records(self, skill_levels: List[SkillLevel]) -> None: