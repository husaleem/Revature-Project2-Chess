from uuid import UUID
from fastapi import Depends, FastAPI, Query, Request, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session


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
from src.api.player_endpoints import router as player_router

# Game dependencies
from src.api.game_endpoints import router as game_router

# Mentorship Dependencies
from src.api.mentorship_router import router as mentorship_router

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


# -- Endpoints --
#
#
#       Games Endpoints
#
#
app.include_router(game_router)
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
#       Player Endpoints
#
#
app.include_router(player_router)
#
#
#       Mentorship Endpoints
#
#
app.include_router(mentorship_router)


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
