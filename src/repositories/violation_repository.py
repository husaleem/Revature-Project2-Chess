from __future__ import annotations

from sqlalchemy.orm import Session
from uuid import UUID

from src.domain.violation import Violation
from src.repositories.violation_repository_protocol import ViolationRepositoryProtocol


class ViolationRepository(ViolationRepositoryProtocol):
    def __init__(self, session: Session):
        self.session = session

    def add(self, violation: Violation) -> Violation:
        self.session.add(violation)
        self.session.commit()
        self.session.refresh(violation) 
        return violation 

    def get_all(self) -> list[Violation]:
        return self.session.query(Violation).all()

    def get_by_id(self, violation_id: UUID) -> Violation | None:
        return (
            self.session.query(Violation)
            .filter(Violation.violation_id == violation_id)
            .one_or_none()
        )

    def get_by_player_id(self, player_id: UUID) -> list[Violation]:
        return (
            self.session.query(Violation)
            .filter(Violation.player_id == player_id)
            .all()
        )

    def get_by_game_id(self, game_id: UUID) -> list[Violation]:
        return (
            self.session.query(Violation)
            .filter(Violation.game_id == game_id)
            .all()
        )

    def update_by_id(self, violation_id: UUID, payload) -> Violation | None:
        violation = self.session.get(Violation, violation_id)
        if not violation:
            return None

        if payload.violation_type is not None:
            violation.set_violation_type(payload.violation_type)
        if payload.violation_date is not None:
            violation.set_violation_date(payload.violation_date)
        if payload.consequence is not None:
            violation.set_consequence(payload.consequence)

        self.session.commit()
        self.session.refresh(violation) 
        return violation

    def delete_by_id(self, violation_id: UUID) -> bool:
        violation = self.session.get(Violation, violation_id)
        if not violation:
            return False

        self.session.delete(violation)
        self.session.commit()
        return True