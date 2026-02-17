from __future__ import annotations

from uuid import UUID

from src.domain.violation import Violation
from src.repositories.violation_repository_protocol import ViolationRepositoryProtocol


class ViolationService:
    def __init__(self, repo: ViolationRepositoryProtocol):
        self.repo = repo

    def get_all(self):
        return self.repo.get_all()

    def get_by_id(self, violation_id: UUID):
        v = self.repo.get_by_id(violation_id)
        if not v:
            raise ValueError(f"Violation {violation_id} not found")
        return v

    def get_by_player_id(self, player_id: UUID):
        return self.repo.get_by_player_id(player_id)

    def get_by_game_id(self, game_id: UUID):
        return self.repo.get_by_game_id(game_id)

    def create(self, payload):
        # pydantic v2
        data = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
        violation = Violation(**data)
        return self.repo.add(violation)

    def update(self, violation_id: UUID, payload):
        updated = self.repo.update_by_id(violation_id, payload)
        if not updated:
            raise ValueError(f"Violation {violation_id} not found")
        return updated

    def delete(self, violation_id: UUID) -> None:
        ok = self.repo.delete_by_id(violation_id)
        if not ok:
            raise ValueError(f"Violation {violation_id} not found")