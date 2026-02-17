from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from src.db.dependencies import get_db
from src.domain.violation import Violation
from src.DTO.violation import (  
    ViolationCreate,
    ViolationRead,
    ViolationUpdate,
)
from src.repositories.violation_repository import ViolationRepository

router = APIRouter(
    prefix="/violations",
    tags=["Violations"],
)

@router.get("/all", response_model=List[ViolationRead])
def get_all_violations(db: Session = Depends(get_db)):
    repo = ViolationRepository(db)
    return repo.get_all()

@router.post("/add", response_model=ViolationRead)
def create_violation(
    payload: ViolationCreate,
    db: Session = Depends(get_db),
):
    repo = ViolationRepository(db)
    violation = Violation(**payload.model_dump())
    return repo.add(violation)

@router.get("/by-id", response_model=ViolationRead)
def get_violation_by_id(
    violation_id: UUID,
    db: Session = Depends(get_db),
):
    repo = ViolationRepository(db)
    return repo.get_by_id(violation_id)

@router.delete("/delete")
def delete_violation(
    violation_id: UUID,
    db: Session = Depends(get_db),
):
    repo = ViolationRepository(db)
    repo.delete(violation_id)
    return {"message": "Violation deleted successfully"}