from uuid import UUID
from sqlalchemy.exc import IntegrityError
from src.domain.exceptions import ValidationError
from src.domain.tournament import Tournament
from src.domain.game import Game, WinState
from src.domain.player import Player
from src.repositories.tournament_repository_protocol import TournamentRepositoryProtocol
from src.repositories.player_repository_protocol import PlayerRepositoryProtocol
from  src.repositories.game_repository_protocol import  GameRepositoryProtocol


'''Get Tournament Participants
Returns player, wins, losses, draws, and rating
Auto Generate Match Bracket
# of Players is 2^n
'''

class BusinessService:
    def __init__(self,
                 tournament_repo: TournamentRepositoryProtocol,
                 game_repo: GameRepositoryProtocol,
                 player_repo: PlayerRepositoryProtocol
        ):
        self.tournament_repo = tournament_repo
        self.game_repo = game_repo
        self.player_repo = player_repo

    def _collect_participant_names(self, games: list[Game]) -> list[str]:
        white_players = [self.player_repo.get_by_id(game.player_white_id) for game in games if game.player_white_id]
        black_players = [self.player_repo.get_by_id(game.player_black_id) for game in games if game.player_black_id]
        unique_players = {player for player in white_players + black_players}
        return [f"{player.first_name} {player.last_name}" for player in unique_players]

    def get_participants_by_tournament_id(self, tournament_id: str):
        games = self.game_repo.find_games_by_tournament_id(tournament_id)
        return self._collect_participant_names(games)

    def get_participants_by_tournament_name(self, name: str):
        tournament = self.tournament_repo.get_tournament_by_name(name)
        games = self.game_repo.find_games_by_tournament_id(tournament.tournament_id)
        return self._collect_participant_names(games)
