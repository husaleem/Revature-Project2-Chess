from uuid import UUID
from fastapi import Depends, FastAPI, Query, Request, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, date
from src.domain.exceptions import (
    NotFoundError,
    ConflictError,
    ValidationError,
    AppError,
)
from src.logging_config import setup_logging
import logging

# DB
from src.db.dependencies import get_db

# Player Dependencies
from src.domain.player import Player
from src.DTO.player import PlayerCreate, PlayerRead
from src.repositories.player_repository import PlayerRepository
from src.services.player_service import PlayerService

# Game dependencies
from src.domain.game import Game, WinState
from src.DTO.game import GameCreate, GameRead
from src.repositories.game_repository import GameRepository
from src.services.game_service import GameService

# Mentorship Dependencies
from src.domain.mentorship import Mentorship
from src.DTO.mentorship import MentorshipCreate, MentorshipRead
from src.repositories.mentorship_repository import MentorshipRepository
from src.services.mentorship_service import MentorshipService

# Tournament Dependencies
from src.api.tournament_endpoints import router as tournament_router

# Skill Level Dependencies
from src.api.skill_level_endpoints import router as skill_level_router

# Game_player Dependecies
from src.services.game_player_service import GamePlayerService
from src.DTO.game_player import GamePlayerCreate, GamePlayerResponse
from src.db.dependencies import get_db


app = FastAPI(title="Chess Tournament API")

setup_logging()
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # Set to DEBUG for more detailed logs


# -- Repositories --
def get_player_repository(db: Session = Depends(get_db)) -> PlayerRepository:
    return PlayerRepository(db)


def get_game_repository(db: Session = Depends(get_db)) -> GameRepository:
    return GameRepository(db)


def get_mentorship_repository(db: Session = Depends(get_db)) -> MentorshipRepository:
    return MentorshipRepository(db)


# -- Services --
def get_player_service(
    repo: PlayerRepository = Depends(get_player_repository),
) -> PlayerService:
    return PlayerService(repo)


def get_game_service(
    repo: GameRepository = Depends(get_game_repository),
) -> GameService:
    return GameService(repo)


def get_mentorship_service(
    repo: MentorshipRepository = Depends(get_mentorship_repository),
) -> MentorshipService:
    return MentorshipService(repo)


# -- Endpoints --
# -- Player Post Endpoints (Create) --
@app.post("/players/add", response_model=str)
def create_player(
    payload: PlayerCreate, svc: PlayerService = Depends(get_player_service)
):
    player = Player(**payload.model_dump())
    return svc.add(player)


# -- Player Get Endpoints (Read) --
@app.get("/players/all", response_model=list[PlayerRead])
def get_all_players(svc: PlayerService = Depends(get_player_service)):
    return svc.get_all()


@app.get("/players/search/by-first-name", response_model=list[PlayerRead])
def get_by_first_name_players(
    first_name: str, svc: PlayerService = Depends(get_player_service)
):
    return svc.get_by_first_name(first_name)


@app.get("/players/search/by-last-name", response_model=list[PlayerRead])
def get_by_last_name_players(
    last_name: str, svc: PlayerService = Depends(get_player_service)
):
    return svc.get_by_last_name(last_name)


@app.get("/players/search/by-full-name", response_model=list[PlayerRead])
def get_by_full_name_players(
    first_name: str,
    last_name: str,
    svc: PlayerService = Depends(get_player_service),
):
    return svc.get_by_full_name(first_name, last_name)


@app.get("/players/search/by-rating", response_model=list[PlayerRead])
def get_by_rating_players(
    rating: int, svc: PlayerService = Depends(get_player_service)
):
    return svc.get_by_rating(rating)


@app.get("/players/search/by-rating-range", response_model=list[PlayerRead])
def get_by_rating_range_players(
    rating_lower: int,
    rating_upper: int,
    svc: PlayerService = Depends(get_player_service),
):
    return svc.get_by_rating_range(rating_lower, rating_upper)


@app.get("/players/search/by-id", response_model=PlayerRead)
def get_by_id_players(player_id: str, svc: PlayerService = Depends(get_player_service)):
    return svc.get_by_id(player_id)


# -- Player Patch Endpoints (Update) --
@app.patch("/players/update/first-name", response_model=PlayerRead)
def update_first_name_by_id_players(
    player_id: str, first_name: str, svc: PlayerService = Depends(get_player_service)
):
    return svc.update_first_name_by_id(player_id, first_name)


@app.patch("/players/update/last-name", response_model=PlayerRead)
def update_last_name_by_id_players(
    player_id: str, last_name: str, svc: PlayerService = Depends(get_player_service)
):
    return svc.update_last_name_by_id(player_id, last_name)


@app.patch("/players/update/full-name", response_model=PlayerRead)
def update_full_name_by_id_players(
    player_id: str,
    first_name: str,
    last_name: str,
    svc: PlayerService = Depends(get_player_service),
):
    return svc.update_full_name_by_id(player_id, first_name, last_name)


@app.patch("/players/update/rating", response_model=PlayerRead)
def update_rating_by_id_players(
    player_id: str, rating: int, svc: PlayerService = Depends(get_player_service)
):
    return svc.update_rating_by_id(player_id, rating)


# -- Player Delete Endpoints (Delete) --
@app.delete("/players/remove", response_model=PlayerRead)
def delete_by_id_players(
    player_id: str, svc: PlayerService = Depends(get_player_service)
):
    return svc.delete_by_id(player_id)


# -- Game Post Endpoints (Create)
@app.post("/games/add", response_model=str)
def add_game(payload: GameCreate, svc: GameService = Depends(get_game_service)):
    game = Game(**payload.model_dump())
    return svc.add_game(game)


# -- Game Get Endpoints (Read)
@app.get("/games/all", response_model=list[GameRead])
def get_all_games(svc: GameService = Depends(get_game_service)):
    return svc.get_all_games()


@app.get("/game/id", response_model=GameRead)
def get_game_by_id(game_id: str, svc: GameService = Depends(get_game_service)):
    return svc.find_game_by_id(game_id)


@app.get("/games/date", response_model=list[GameRead])
def get_games_on_date(date: date, svc: GameService = Depends(get_game_service)):
    return svc.find_games_by_played_date(date)


@app.get("/games/result", response_model=list[GameRead])
def get_games_by_result(result: WinState, svc: GameService = Depends(get_game_service)):
    return svc.find_games_by_result(result)


@app.get("/games/tournament", response_model=list[GameRead])
def get_games_by_tournament(
    tournament_id: str, svc: GameService = Depends(get_game_service)
):
    return svc.find_games_by_tournament_id(tournament_id)


# -- Game Patch Endpoints (Update)
@app.patch("/game/update/result", response_model=GameRead)
def update_game_result(
    game_id: str, result: WinState, svc: GameService = Depends(get_game_service)
):
    return svc.update_game_result(game_id, result)


@app.patch("/game/update/date", response_model=GameRead)
def update_game_date(
    game_id: str, date: datetime, svc: GameService = Depends(get_game_service)
):
    return svc.update_game_played_at(game_id, date)


@app.patch("/game/update/tournament", response_model=GameRead)
def update_game_tournament(
    game_id: str, tournament_id: str, svc: GameService = Depends(get_game_service)
):
    return svc.update_game_tournament_id(game_id, tournament_id)


# -- Game Delete Endpoints (Delete) --
@app.delete("/game/delete", response_model=str)
def delete_game(game_id: str, svc: GameService = Depends(get_game_service)):
    return svc.delete_game_by_id(game_id)


#
#
#       Tournaments Endpoints
#
#
app.include_router(tournament_router)
#
#
#       Skill Levels Endpoints
#
#
app.include_router(skill_level_router)


# -- Mentorship Post Endpoints (Create) --
@app.post("/mentorships/add", response_model=MentorshipRead)
def create_mentorship(
    payload: MentorshipCreate,
    svc: MentorshipService = Depends(get_mentorship_service),
):
    mentorship = Mentorship(**payload.model_dump())
    return svc.add(mentorship)


# -- Mentorship Get Endpoints (Read) --
@app.get("/mentorships/search/all", response_model=list[MentorshipRead])
def get_all_mentorships(
    svc: MentorshipService = Depends(get_mentorship_service),
):
    return svc.get_all()


@app.get("/mentorships/search/by-player-id", response_model=list[MentorshipRead])
def get_by_player_id_mentorships(
    player_id: str, svc: MentorshipService = Depends(get_mentorship_service)
):
    return svc.get_by_player_id(player_id)


@app.get("/mentorships/search/by-mentor-id", response_model=list[MentorshipRead])
def get_by_mentor_id_mentorships(
    mentor_id: str, svc: MentorshipService = Depends(get_mentorship_service)
):
    return svc.get_by_mentor_id(mentor_id)


@app.get("/mentorships/search/by-player-and-mentor-id", response_model=MentorshipRead)
def get_by_player_and_mentor_id_mentorships(
    player_id: str,
    mentor_id: str,
    svc: MentorshipService = Depends(get_mentorship_service),
):
    return svc.get_by_player_and_mentor_id(player_id, mentor_id)


# -- Mentorship Patch Endpoints (Update) --
@app.patch("/mentorships/update/by-player-and-mentor-id", response_model=MentorshipRead)
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
@app.delete(
    "/mentorships/delete/by-player-and-mentor-id",
    response_model=MentorshipRead,
)
def delete_by_player_and_mentor_id_mentorships(
    player_id: str,
    mentor_id: str,
    svc: MentorshipService = Depends(get_mentorship_service),
):
    return svc.delete_by_player_and_mentor_id(player_id, mentor_id)


#
#
#       Global Exception Handler
#
#
@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError):
    logger.warning(f"NotFoundError: {exc}")
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc)},
    )


@app.exception_handler(ConflictError)
async def conflict_handler(request: Request, exc: ConflictError):
    logger.warning(f"ConflictError: {exc}")
    return JSONResponse(
        status_code=409,
        content={"detail": str(exc)},
    )


@app.exception_handler(ValidationError)
async def validation_handler(request: Request, exc: ValidationError):
    logger.warning(f"ValidationError: {exc}")
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
    )


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    # fallback for any other custom app errors
    logger.error(f"AppError: {exc}")
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    # FastAPI / Starlette built-in HTTP errors
    logger.error(f"HTTPException {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Last-resort catch-all
    logger.exception(f"Unhandled Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Game_player End points
game_player_service = GamePlayerService()


@app.post("/game-players", response_model=GamePlayerResponse)
def create_game_player(dto: GamePlayerCreate, db: Session = Depends(get_db)):
    return game_player_service.create_game_player(db, dto)


@app.get("/game-players", response_model=list[GamePlayerResponse])
def get_all_game_players(db: Session = Depends(get_db)):
    return game_player_service.get_all_game_players(db)


@app.delete("/game-players/{game_id}/{player_id}")
def delete_game_player(game_id: int, player_id: int, db: Session = Depends(get_db)):
    gp = game_player_service.delete_game_player(db, game_id, player_id)
    if not gp:
        raise HTTPException(status_code=404, detail="Game_Player not found")
    return {"message": "Deleted successfully"}
