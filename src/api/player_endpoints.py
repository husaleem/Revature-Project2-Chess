from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.domain.player import Player
from src.db.dependencies import get_db
from src.DTO.player import PlayerCreate, PlayerRead
from src.repositories.player_repository import PlayerRepository
from src.services.player_service import PlayerService

router = APIRouter(prefix="/players", tags=["Player"])


def get_player_repository(db: Session = Depends(get_db)) -> PlayerRepository:
    return PlayerRepository(db)


def get_player_service(
    repo: PlayerRepository = Depends(get_player_repository),
) -> PlayerService:
    return PlayerService(repo)


# -- Player Post Endpoints (Create) --
@router.post("/add", response_model=str)
def create_player(
    payload: PlayerCreate, svc: PlayerService = Depends(get_player_service)
):
    player = Player(**payload.model_dump())
    return svc.add(player)


# -- Player Get Endpoints (Read) --
@router.get("/all", response_model=list[PlayerRead])
def get_all_players(svc: PlayerService = Depends(get_player_service)):
    return svc.get_all()


@router.get("/search/by-first-name", response_model=list[PlayerRead])
def get_by_first_name_players(
    first_name: str, svc: PlayerService = Depends(get_player_service)
):
    return svc.get_by_first_name(first_name)


@router.get("/search/by-last-name", response_model=list[PlayerRead])
def get_by_last_name_players(
    last_name: str, svc: PlayerService = Depends(get_player_service)
):
    return svc.get_by_last_name(last_name)


@router.get("/search/by-full-name", response_model=list[PlayerRead])
def get_by_full_name_players(
    first_name: str,
    last_name: str,
    svc: PlayerService = Depends(get_player_service),
):
    return svc.get_by_full_name(first_name, last_name)


@router.get("/search/by-rating", response_model=list[PlayerRead])
def get_by_rating_players(
    rating: int, svc: PlayerService = Depends(get_player_service)
):
    return svc.get_by_rating(rating)


@router.get("/search/by-rating-range", response_model=list[PlayerRead])
def get_by_rating_range_players(
    rating_lower: int,
    rating_upper: int,
    svc: PlayerService = Depends(get_player_service),
):
    return svc.get_by_rating_range(rating_lower, rating_upper)


@router.get("/search/by-id", response_model=PlayerRead)
def get_by_id_players(player_id: str, svc: PlayerService = Depends(get_player_service)):
    return svc.get_by_id(player_id)


# -- Player Patch Endpoints (Update) --
@router.patch("/update/first-name", response_model=PlayerRead)
def update_first_name_by_id_players(
    player_id: str, first_name: str, svc: PlayerService = Depends(get_player_service)
):
    return svc.update_first_name_by_id(player_id, first_name)


@router.patch("/update/last-name", response_model=PlayerRead)
def update_last_name_by_id_players(
    player_id: str, last_name: str, svc: PlayerService = Depends(get_player_service)
):
    return svc.update_last_name_by_id(player_id, last_name)


@router.patch("/update/full-name", response_model=PlayerRead)
def update_full_name_by_id_players(
    player_id: str,
    first_name: str,
    last_name: str,
    svc: PlayerService = Depends(get_player_service),
):
    return svc.update_full_name_by_id(player_id, first_name, last_name)


@router.patch("/update/rating", response_model=PlayerRead)
def update_rating_by_id_players(
    player_id: str, rating: int, svc: PlayerService = Depends(get_player_service)
):
    return svc.update_rating_by_id(player_id, rating)


# -- Player Delete Endpoints (Delete) --
@router.delete("/remove", response_model=PlayerRead)
def delete_by_id_players(
    player_id: str, svc: PlayerService = Depends(get_player_service)
):
    return svc.delete_by_id(player_id)
