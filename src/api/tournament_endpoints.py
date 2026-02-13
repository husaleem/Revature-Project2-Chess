from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.db.dependencies import get_db
from src.DTO.tournament_dto import TournamentCreate, TournamentRead, TournamentUpdate
from src.repositories.tournament_repository import TournamentRepository
from src.services.tournament_service import TournamentService

router = APIRouter(prefix="/tournaments", tags=["Tournaments"])

def get_tournament_repository(db: Session = Depends(get_db)) -> TournamentRepository:    
    return TournamentRepository(db)

def get_tournament_service(
    db: Session = Depends(get_db),
    repo: TournamentRepository = Depends(get_tournament_repository),
) -> TournamentService:
    return TournamentService(db, repo)


#endpoint 1 - GET all tournaments
@router.get("", response_model=list[TournamentRead])
def get_all_tournaments(
    svc: TournamentService = Depends(get_tournament_service),
):
    return svc.get_all_tournaments()

#endpoint 2 - GET tournament by id
@router.get("/{tournament_id}", response_model=TournamentRead)
def get_tournament_by_id(
    tournament_id: UUID,
    svc: TournamentService = Depends(get_tournament_service),
):
    return svc.get_tournament_by_id(tournament_id)

#endpoint 3 - POST add tournament
@router.post("", response_model=TournamentRead, status_code=status.HTTP_201_CREATED)
def add_tournament(payload: TournamentCreate, svc: TournamentService = Depends(get_tournament_service)):
    return svc.add_tournament(payload)

#endpoint 4 - PUT update tournament
@router.put("/{tournament_id}", response_model=TournamentRead)
def update_tournament(
    tournament_id: UUID, 
    payload: TournamentUpdate, 
    svc: TournamentService = Depends(get_tournament_service)
):
    return svc.update_tournament(tournament_id, payload)

#endpoint 5 - DELETE tournament
@router.delete("/{tournament_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tournament(
    tournament_id: UUID, 
    svc: TournamentService = Depends(get_tournament_service)
):
    svc.delete_tournament(tournament_id)
    return
