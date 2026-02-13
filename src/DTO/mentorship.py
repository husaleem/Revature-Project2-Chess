from uuid import UUID
from pydantic import BaseModel


class MentorshipCreate(BaseModel):
    player_id: UUID
    mentor_id: UUID


class MentorshipRead(BaseModel):
    player_id: UUID
    mentor_id: UUID

    class Config:
        from_attributes = True
        fields = {"player_id": ..., "mentor_id": ...}
