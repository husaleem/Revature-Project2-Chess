from uuid import UUID
from fastapi import Depends, FastAPI, Query, HTTPException
from sqlalchemy.orm import Session

# DB
from src.db.dependencies import get_db

# Player Dependencies
from src.domain.player import Player
from src.DTO.player import PlayerCreate, PlayerRead
from src.repositories.player_repository import PlayerRepository
from src.services.player_service import PlayerService


#game_player dependencies
from src.services.game_player_service import GamePlayerService
from src.DTO.game_player import GamePlayerCreate, GamePlayerResponse


app = FastAPI(title="Chess Tournament API")


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
# -- Player Get Endpoints (Read) --
@app.get("/players/all", response_model=list[PlayerRead])
def get_all_players():
    svc = PlayerService(Depends(get_player_service))
    return svc.get_all()


@app.get("/players/by-first-name/{first_name}")
def get_by_first_name_players(first_name: str):
    svc = PlayerService(Depends(get_player_service))
    return svc.get_by_first_name(first_name)

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
# -- Player Patch Endpoints (Update) --
# -- Player Delete Endpoints (Delete) --
