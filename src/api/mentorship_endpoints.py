from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.domain.mentorship import Mentorship
from src.db.dependencies import get_db
from src.DTO.mentorship import MentorshipCreate, MentorshipRead
from src.repositories.mentorship_repository import MentorshipRepository
from src.services.mentorship_service import MentorshipService

router = APIRouter(prefix="/mentorships", tags=["Mentorship"])


def get_mentorship_repository(db: Session = Depends(get_db)) -> MentorshipRepository:
    return MentorshipRepository(db)


def get_mentorship_service(
    repo: MentorshipRepository = Depends(get_mentorship_repository),
) -> MentorshipService:
    return MentorshipService(repo)


# -- Mentorship Post Endpoints (Create) --
@router.post("/add", response_model=MentorshipRead)
def create_mentorship(
    payload: MentorshipCreate,
    svc: MentorshipService = Depends(get_mentorship_service),
):
    mentorship = Mentorship(**payload.model_dump())
    return svc.add(mentorship)


# -- Mentorship Get Endpoints (Read) --
@router.get("/search/all", response_model=list[MentorshipRead])
def get_all_mentorships(
    svc: MentorshipService = Depends(get_mentorship_service),
):
    return svc.get_all()


@router.get("/search/by-player-id", response_model=list[MentorshipRead])
def get_by_player_id_mentorships(
    player_id: str, svc: MentorshipService = Depends(get_mentorship_service)
):
    return svc.get_by_player_id(player_id)


@router.get("/search/by-mentor-id", response_model=list[MentorshipRead])
def get_by_mentor_id_mentorships(
    mentor_id: str, svc: MentorshipService = Depends(get_mentorship_service)
):
    return svc.get_by_mentor_id(mentor_id)


@router.get("/search/by-player-and-mentor-id", response_model=MentorshipRead)
def get_by_player_and_mentor_id_mentorships(
    player_id: str,
    mentor_id: str,
    svc: MentorshipService = Depends(get_mentorship_service),
):
    return svc.get_by_player_and_mentor_id(player_id, mentor_id)


# -- Mentorship Patch Endpoints (Update) --
@router.patch("/update/by-player-and-mentor-id", response_model=MentorshipRead)
def update_by_player_and_mentor_id_mentorships(
    player_id: str,
    mentor_id: str,
    new_player_id: str,
    new_mentor_id: str,
    svc: MentorshipService = Depends(get_mentorship_service),
):
    return svc.update_by_player_and_mentor_id(
        player_id, mentor_id, new_player_id, new_mentor_id
    )


# -- Mentorship Delete Endpoints (Delete) --
@router.delete(
    "/delete/by-player-and-mentor-id",
    response_model=MentorshipRead,
)
def delete_by_player_and_mentor_id_mentorships(
    player_id: str,
    mentor_id: str,
    svc: MentorshipService = Depends(get_mentorship_service),
):
    return svc.delete_by_player_and_mentor_id(player_id, mentor_id)
