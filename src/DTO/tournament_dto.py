from datetime import date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

class TournamentCreate(BaseModel):
    name: str
    start_date: date
    end_date: date
    location: str
    
class TournamentRead(BaseModel):
    tournament_id: UUID
    name: str
    start_date: date
    end_date: date
    location: str
      
    class Config:
        from_attributes = True
        fields = {
            "tournament_id": ...,
            "name": ...,
            "start_date": ...,
            "end_date": ...,
            "location": ...,
        }
        
class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    location: Optional[str] = None