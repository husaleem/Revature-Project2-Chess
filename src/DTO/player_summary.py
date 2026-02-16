from pydantic import BaseModel

class PlayerSummary(BaseModel):
    first_name: str
    last_name: str
    rating: str
    title: str
    total_games: int
    win_rate: float