from sqlalchemy.orm import Session
from src.domain.violation import Violation
from src.repositories.violation_repository_protocol import ViolationRepositoryProtocol


class ViolationRepository(ViolationRepositoryProtocol):
    def __init__(self, session: Session):
        self.session = session


    def add(self, violation: Violation) -> str:
        self.session.add(violation)
        self.session.commit()
        return str(violation.violation_id)

    def get_all(self) -> list[Violation]:
        return self.session.query(Violation).all()

    def get_by_id(self, violation_id: str) -> Violation:
        return (
            self.session.query(Violation)
            .filter(Violation.violation_id == violation_id)
            .one_or_none()
        )

    def get_by_player_id(self, player_id: str) -> list[Violation]:
        return (
            self.session.query(Violation)
            .filter(Violation.player_id == player_id)
            .all()
        )

    def get_by_game_id(self, game_id: str) -> list[Violation]:
        return (
            self.session.query(Violation)
            .filter(Violation.game_id == game_id)
            .all()
        )

    def update_by_id(self, violation_id: str, payload) -> Violation:
        violation = self.session.get(Violation, violation_id)
        if not violation:
            raise Exception("Violation not found")

        if payload.violation_type is not None:
            violation.set_violation_type(payload.violation_type)
        if payload.violation_date is not None:
            violation.set_violation_date(payload.violation_date)
        if payload.consequence is not None:
            violation.set_consequence(payload.consequence)

        self.session.commit()
        self.session.refresh()
        return violation

    def delete_by_id(self, violation_id: str) -> Violation:
        violation = self.session.get(Violation, violation_id)
        if not violation:
            raise Exception("Violation not found")

        self.session.delete(violation)
        self.session.commit()
        self.session.refresh()
        return violation