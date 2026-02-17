from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.domain.game import Game, WinState
from src.db.dependencies import get_db
from src.DTO.game import GameCreate, GameRead
from src.repositories.game_repository import GameRepository
from src.services.game_service import GameService

router = APIRouter(prefix="/games", tags=["Game"])

def get_game_repository(db: Session = Depends(get_db)) -> GameRepository:
    return GameRepository(db)

def get_game_service(
    repo: GameRepository = Depends(get_game_repository),
) -> GameService:
    return GameService(repo)


# -- Game Post Endpoints (Create)
@router.post("/add", response_model=str)
def add_game(payload: GameCreate, svc: GameService = Depends(get_game_service)):
    game = Game(**payload.model_dump())
    return svc.add_game(game)


# -- Game Get Endpoints (Read)
@router.get("/all", response_model=list[GameRead])
def get_all_games(svc: GameService = Depends(get_game_service)):
    return svc.get_all_games()


@router.get("/id", response_model=GameRead)
def get_game_by_id(game_id: str, svc: GameService = Depends(get_game_service)):
    return svc.find_game_by_id(game_id)


@router.get("/date", response_model=list[GameRead])
def get_games_on_date(SearchDate: date, svc: GameService = Depends(get_game_service)):
    return svc.find_games_by_played_date(SearchDate)


@router.get("/result", response_model=list[GameRead])
def get_games_by_result(result: WinState, svc: GameService = Depends(get_game_service)):
    return svc.find_games_by_result(result)


@router.get("/tournament", response_model=list[GameRead])
def get_games_by_tournament(
    tournament_id: str, svc: GameService = Depends(get_game_service)
):
    return svc.find_games_by_tournament_id(tournament_id)


# -- Game Patch Endpoints (Update)
@router.patch("/update/result", response_model=GameRead)
def update_game_result(
    game_id: str, result: WinState, svc: GameService = Depends(get_game_service)
):
    return svc.update_game_result(game_id, result)


@router.patch("/update/date", response_model=GameRead)
def update_game_date(
    game_id: str, NewDate: datetime, svc: GameService = Depends(get_game_service)
):
    return svc.update_game_played_at(game_id, NewDate)


@router.patch("/update/tournament", response_model=GameRead)
def update_game_tournament(
    game_id: str, tournament_id: str, svc: GameService = Depends(get_game_service)
):
    return svc.update_game_tournament_id(game_id, tournament_id)


# -- Game Delete Endpoints (Delete) --
@router.delete("/delete", response_model=str)
def delete_game(game_id: str, svc: GameService = Depends(get_game_service)):
    return svc.delete_game_by_id(game_id)


# -- Generate brackets
@router.get("/generate-tournament-bracket/{tournament_id}", response_model=str)
def generate_match_bracket(tournament_id: str, svc: GameService = Depends(get_game_service)):
    try:
        return svc.generate_match_bracket(tournament_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
