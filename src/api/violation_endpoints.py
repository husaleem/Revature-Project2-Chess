from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from src.db.dependencies import get_db
from src.DTO.violation import ViolationCreate, ViolationRead, ViolationUpdate
from src.repositories.violation_repository import ViolationRepository
from src.services.violation_service import ViolationService

router = APIRouter(prefix="/violations", tags=["Violations"])


def get_violation_service(db: Session = Depends(get_db)) -> ViolationService:
    repo = ViolationRepository(db)
    return ViolationService(repo)


@router.get("/all", response_model=List[ViolationRead])
def get_all_violations(service: ViolationService = Depends(get_violation_service)):
    return service.get_all()


@router.post("/add", response_model=ViolationRead, status_code=status.HTTP_201_CREATED)
def create_violation(
    payload: ViolationCreate,
    service: ViolationService = Depends(get_violation_service),
):
    return service.create(payload)


@router.get("/by-id", response_model=ViolationRead)
def get_violation_by_id(
    violation_id: UUID,
    service: ViolationService = Depends(get_violation_service),
):
    try:
        return service.get_by_id(violation_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/by-player", response_model=List[ViolationRead])
def get_violations_by_player(
    player_id: UUID,
    service: ViolationService = Depends(get_violation_service),
):
    return service.get_by_player_id(player_id)


@router.get("/by-game", response_model=List[ViolationRead])
def get_violations_by_game(
    game_id: UUID,
    service: ViolationService = Depends(get_violation_service),
):
    return service.get_by_game_id(game_id)


@router.put("/update", response_model=ViolationRead)
def update_violation(
    violation_id: UUID,
    payload: ViolationUpdate,
    service: ViolationService = Depends(get_violation_service),
):
    try:
        return service.update(violation_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/delete", status_code=status.HTTP_200_OK)
def delete_violation(
    violation_id: UUID,
    service: ViolationService = Depends(get_violation_service),
):
    try:
        service.delete(violation_id)
        return {"message": "Violation deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))