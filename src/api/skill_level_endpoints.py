from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.db.dependencies import get_db
from src.DTO.skill_level_dto import SkillLevelCreate, SkillLevelRead, SkillLevelUpdate
from src.repositories.skill_level_repository import SkillLevelRepository
from src.services.skill_level_service import SkillLevelService

router = APIRouter(prefix="/skill-levels", tags=["Skill Levels"])

def get_skill_level_repository(db: Session = Depends(get_db)) -> SkillLevelRepository:    
    return SkillLevelRepository(db)

def get_skill_level_service(
    db: Session = Depends(get_db),
    repo: SkillLevelRepository = Depends(get_skill_level_repository),
) -> SkillLevelService:
    return SkillLevelService(db, repo)


#endpoint 1 - GET all skill levels
@router.get("", response_model=list[SkillLevelRead])
def get_all_skill_levels(svc: SkillLevelService = Depends(get_skill_level_service)):
    return svc.get_all_skill_levels()

#endpoint 2 - GET skill level by title
@router.get("/{title}", response_model=SkillLevelRead)
def get_skill_level_by_title(
    title: str,
    svc: SkillLevelService = Depends(get_skill_level_service),
):
    return svc.get_skill_level_by_title(title)

#endpoint 3 - POST add skill level
@router.post("", response_model=str, status_code=status.HTTP_201_CREATED)
def add_skill_level(payload: SkillLevelCreate, svc: SkillLevelService = Depends(get_skill_level_service)):
    return svc.add_skill_level(payload)

#endpoint 4 - PUT update skill level
@router.put("/{title}", response_model=SkillLevelRead)
def update_skill_level(
    title: str, 
    payload: SkillLevelUpdate, 
    svc: SkillLevelService = Depends(get_skill_level_service)
):
    return svc.update_skill_level(title, payload)

#endpoint 5 - DELETE skill level
@router.delete("/{title}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill_level(
    title: str, 
    svc: SkillLevelService = Depends(get_skill_level_service)
):
    svc.delete_skill_level(title)
    return