from typing import Protocol
from src.domain.mentorship import Mentorship


class MentorshipRepositoryProtocol(Protocol):
    # -- Create Operations --
    def add(self, mentorship: Mentorship) -> Mentorship: ...

    # -- Read Operations --
    def get_all(self) -> list[Mentorship]: ...

    def get_by_player_id(self, player_id: str) -> list[Mentorship]: ...

    def get_by_mentor_id(self, mentor_id: str) -> list[Mentorship]: ...

    def get_by_player_and_mentor_id(
        self, player_id: str, mentor_id: str
    ) -> Mentorship: ...

    # -- Update Operations --
    def update_by_player_and_mentor_id(
        self, player_id: str, mentor_id: str, new_player_id: str, new_mentor_id: str
    ) -> Mentorship: ...

    # -- Delete Operations --
    def delete_by_player_and_mentor_id(
        self, player_id: str, mentor_id: str
    ) -> Mentorship: ...