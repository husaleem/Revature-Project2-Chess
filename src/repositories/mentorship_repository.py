from sqlalchemy.orm import Session
from src.domain.mentorship import Mentorship
from src.repositories.mentorship_repository_protocol import MentorshipRepositoryProtocol


class MentorshipRepository(MentorshipRepositoryProtocol):
    def __init__(self, session: Session):
        self.session = session

    def add(self, mentorship: Mentorship) -> Mentorship:
        self.session.add(mentorship)
        self.session.commit()
        return mentorship

    # -- Read Operations --
    def get_all(self) -> list[Mentorship]:
        return self.session.query(Mentorship).all()

    def get_by_player_id(self, player_id: str) -> list[Mentorship]:
        return self.session.query(Mentorship).filter(Mentorship.player_id == player_id)

    def get_by_mentor_id(self, mentor_id: str) -> list[Mentorship]:
        return self.session.query(Mentorship).filter(Mentorship.mentor_id == mentor_id)

    def get_by_player_and_mentor_id(self, player_id: str, mentor_id: str) -> Mentorship:
        return (
            self.session.query(Mentorship)
            .filter(
                Mentorship.player_id == player_id and Mentorship.mentor_id == mentor_id
            )
            .one_or_none()
        )

    # -- Update Operations --
    def update_by_player_and_mentor_id(
        self, player_id: str, mentor_id: str, new_player_id: str, new_mentor_id: str
    ) -> Mentorship:
        mentorship = self.session.get(Mentorship, (player_id, mentor_id))
        if not mentorship:
            raise Exception("Mentorship not found")
        mentorship.set_mentorship(new_player_id, new_mentor_id)
        self.session.commit()
        self.session.refresh(mentorship)
        return mentorship

    # -- Delete Operations --
    def delete_by_player_and_mentor_id(
        self, player_id: str, mentor_id: str
    ) -> Mentorship:
        mentorship = self.session.get(Mentorship, (player_id, mentor_id))
        if not mentorship:
            raise Exception("Mentorship not found")
        self.session.delete(mentorship)
        self.session.commit()
        return mentorship
