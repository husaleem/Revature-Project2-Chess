from datetime import date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ValidationInfo, field_validator

class TournamentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    start_date: date
    end_date: date
    location: str = Field(..., min_length=1, max_length=100)
    
    @field_validator('end_date')
    @classmethod
    def validate_end_date(cls, end_date: date, info: ValidationInfo) -> date:
        start_date = info.data.get('start_date')
        if start_date and end_date < start_date:
            raise ValueError('End date must be after start date.')
        return end_date
    
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
        
class TournamentParticipantRead(BaseModel):
    player_id: UUID
    first_name: str
    last_name: str
    rating: Optional[int] = None
    wins: int
    losses: int
    draws: int

    class Config:
        from_attributes = True

class TournamentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    location: Optional[str] = Field(None, min_length=1, max_length=255)
    
    @field_validator("end_date")
    @classmethod
    def validate_end_date_patch(cls, v: Optional[date], info: ValidationInfo) -> Optional[date]:
        """
        In PATCH, start_date might not be provided.
        If both are present in the request, validate their relationship.
        If start_date isn't provided, we can't validate here (service will validate using DB values).
        """
        start_date = info.data.get("start_date")
        if v is not None and start_date is not None and v < start_date:
            raise ValueError("end_date cannot be before start_date")
        return v