from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.db.dependencies import get_db
from src.DTO.player_summary import PlayerSummary
from src.repositories.relations_repository import RelationsRepository
from src.services.relations_service import RelationsService

router = APIRouter(prefix="/relations", tags=["Relations"])


def get_relations_repository(db: Session = Depends(get_db)) -> RelationsRepository:
    return RelationsRepository(db)


def get_relations_service(
    repo: RelationsRepository = Depends(get_relations_repository),
) -> RelationsService:
    return RelationsService(repo)


@router.get("/player_summary", response_model=PlayerSummary)
def get_player_summary_by_id(
    player_id: str, svc: RelationsService = Depends(get_relations_service)
):
    return svc.get_player_summary_by_id(player_id)
