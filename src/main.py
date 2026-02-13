from uuid import UUID
from fastapi import Depends, FastAPI, Query, Request, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from src.domain.exceptions import NotFoundError, ConflictError, ValidationError, AppError
from src.logging_config import setup_logging
import logging

# DB
from src.db.dependencies import get_db

# Player Dependencies
from src.domain.player import Player
from src.DTO.player import PlayerCreate, PlayerRead
from src.repositories.player_repository import PlayerRepository
from src.services.player_service import PlayerService

# Tournament Dependencies
from src.api.tournament_endpoints import router as tournament_router
# Skill Level Dependencies
from src.api.skill_level_endpoints import router as skill_level_router

app = FastAPI(title="Chess Tournament API")

setup_logging()
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # Set to DEBUG for more detailed logs

# -- Repositories --
def get_player_repository(db: Session = Depends(get_db)) -> PlayerRepository:
    return PlayerRepository(db)


# -- Services --
def get_player_service(
    repo: PlayerRepository = Depends(get_player_repository),
) -> PlayerService:
    return PlayerService(repo)


# -- Endpoints --
# -- Player Post Endpoints (Create) --
@app.post("/players/add", response_model=str)
def create_player(payload: PlayerCreate):
    svc = PlayerService(Depends(get_player_service))
    player = Player(**payload.model_dump())
    return svc.add(player)


# -- Player Get Endpoints (Read) --
@app.get("/players/all", response_model=list[PlayerRead])
def get_all_players():
    svc = PlayerService(Depends(get_player_service))
    return svc.get_all()


@app.get("/players/search/by-first-name", response_model=list[PlayerRead])
def get_by_first_name_players(first_name: str):
    svc = PlayerService(Depends(get_player_service))
    return svc.get_by_first_name(first_name)


@app.get("/players/search/by-last-name", response_model=list[PlayerRead])
def get_by_last_name_players(last_name: str):
    svc = PlayerService(Depends(get_player_service))
    return svc.get_by_last_name(last_name)


@app.get("/players/search/by-full-name", response_model=list[PlayerRead])
def get_by_full_name_players(first_name: str, last_name: str):
    svc = PlayerService(Depends(get_player_service))
    return svc.get_by_full_name(first_name, last_name)


@app.get("/players/search/by-rating", response_model=list[PlayerRead])
def get_by_rating_players(rating: int):
    svc = PlayerService(Depends(get_player_service))
    return svc.get_by_rating(rating)


@app.get("/players/search/by-rating-range", response_model=list[PlayerRead])
def get_by_rating_range_players(rating_lower: int, rating_upper: int):
    svc = PlayerService(Depends(get_player_service))
    return svc.get_by_rating_range(rating_lower, rating_upper)


@app.get("/players/search/by-id", response_model=PlayerRead)
def get_by_id_players(player_id: str):
    svc = PlayerService(Depends(get_player_service))
    return svc.get_by_id(player_id)


# -- Player Patch Endpoints (Update) --
@app.patch("/players/update/first-name", response_model=PlayerRead)
def update_first_name_by_id_players(player_id: str, first_name: str):
    svc = PlayerService(Depends(get_player_service))
    return svc.update_first_name_by_id(player_id, first_name)


@app.patch("/players/update/last-name", response_model=PlayerRead)
def update_last_name_by_id_players(player_id: str, last_name: str):
    svc = PlayerService(Depends(get_player_service))
    return svc.update_last_name_by_id(player_id, last_name)


@app.patch("/players/update/full-name", response_model=PlayerRead)
def update_full_name_by_id_players(player_id: str, first_name: str, last_name: str):
    svc = PlayerService(Depends(get_player_service))
    return svc.update_full_name_by_id(player_id, first_name, last_name)


@app.patch("/players/update/rating", response_model=PlayerRead)
def update_rating_by_id_players(player_id: str, rating: int):
    svc = PlayerService(Depends(get_player_service))
    return svc.update_rating_by_id(player_id, rating)


# -- Player Delete Endpoints (Delete) --
@app.delete("/players/remove", response_model=PlayerRead)
def delete_by_id_players(player_id: str):
    svc = PlayerService(Depends(get_player_service))
    return svc.delete_by_id(player_id)


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
