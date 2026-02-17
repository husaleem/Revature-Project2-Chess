from src.repositories.mentorship_repository_protocol import MentorshipRepositoryProtocol
from src.domain.mentorship import Mentorship


class MentorshipService:
    def __init__(self, repo: MentorshipRepositoryProtocol):
        self.repo = repo

    def add(self, mentorship: Mentorship) -> Mentorship:
        if not isinstance(mentorship, Mentorship):
            raise ValueError(
                f"Expected type (Mentorship), but received ({type(mentorship)})"
            )
        return self.repo.add(mentorship)

    def get_all(self) -> list[Mentorship]:
        return self.repo.get_all()

    def get_by_player_id(self, player_id: str) -> list[Mentorship]:
        if not isinstance(player_id, str):
            raise ValueError(f"Expected type (str), but received ({type(player_id)})")
        return self.repo.get_by_player_id(player_id)

    def get_by_mentor_id(self, mentor_id: str) -> list[Mentorship]:
        if not isinstance(mentor_id, str):
            raise ValueError(f"Expected type (str), but received ({type(mentor_id)})")
        return self.repo.get_by_mentor_id(mentor_id)

    def get_by_player_and_mentor_id(self, player_id: str, mentor_id: str) -> Mentorship:
        if not (isinstance(player_id, str) or isinstance(mentor_id, str)):
            raise ValueError(
                f"Expected type (str, str), but received ({type(player_id)}, {type(mentor_id)})"
            )
        return self.repo.get_by_player_and_mentor_id(player_id, mentor_id)

    def update_by_player_and_mentor_id(
        self, player_id: str, mentor_id: str, new_player_id: str, new_mentor_id: str
    ) -> Mentorship:
        if not (
            isinstance(player_id, str)
            or isinstance(mentor_id, str)
            or isinstance(new_player_id, str)
            or isinstance(new_mentor_id, str)
        ):
            raise ValueError(
                f"Expected type (str, str, str, str), but received ({type(player_id)}, {type(mentor_id)}, {type(new_player_id)}, {type(new_mentor_id)})"
            )
        return self.repo.update_by_player_and_mentor_id(
            player_id, mentor_id, new_player_id, new_mentor_id
        )

    def delete_by_player_and_mentor_id(
        self, player_id: str, mentor_id: str
    ) -> Mentorship:
        if not (isinstance(player_id, str) or isinstance(mentor_id, str)):
            raise ValueError(
                f"Expected type (str, str), but received ({type(player_id)}, {type(mentor_id)})"
            )
        return self.repo.delete_by_player_and_mentor_id(player_id, mentor_id)
