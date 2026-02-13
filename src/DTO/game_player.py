from pydantic import BaseModel

class GamePlayerCreate(BaseModel):
    game_id: int
    player_id: int
    color: str
    result: str

class GamePlayerResponse(GamePlayerCreate):
    class Config:
        orm_mode = True
