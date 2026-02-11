from uuid import UUID
from fastapi import Depends, FastAPI, Query
from sqlalchemy.orm import Session

# DB
from src.db.dependencies import get_db

# Player Dependencies
from src.domain.player import Player
from src.DTO.player import PlayerCreate, PlayerRead
from src.repositories.player_repository import PlayerRepository
from src.services.player_service import PlayerService


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
# -- Player Endpoints --
