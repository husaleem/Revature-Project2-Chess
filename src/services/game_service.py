from src.repositories.game_repository_protocol import GameRepositoryProtocol
from src.domain.game import Game, WinState
from datetime import datetime, date


class GameService:
    def __init__(self, repo: GameRepositoryProtocol):
        self.repo = repo

    def add_game(self, game: Game) -> str:
        if not isinstance(game, Game):
            raise ValueError(f"Expected type (Game), but received ({type(game)})")
        return self.repo.add_game(game)

    def find_game_by_id(self, game_id: str) -> Game:
        if not isinstance(game_id, str):
            raise ValueError(f"Expected type (str), but received ({type(game_id)})")
        game = self.repo.find_game_by_id(game_id)
        if not game:
            raise Exception("Book not found")
        return game

    def get_all_games(self) -> list[Game]:
        return self.repo.get_all_games()

    def find_games_by_played_date(self, played_date: date) -> list[Game]:
        if not isinstance(played_date, date):
            raise ValueError(f"Expected type (date), but received ({type(played_date)})")
        return self.repo.find_games_by_played_date(played_date)

    def find_games_by_result(self, result: WinState) -> list[Game]:
        if not isinstance(result, WinState):
            raise ValueError(f"Expected type (WinState), but received ({type(result)})")
        return self.repo.find_games_by_result(result)

    def find_games_by_tournament_id(self, tournament_id: str) -> list[Game]:
        if not isinstance(tournament_id, str):
            raise ValueError(f"Expected type (str), but received ({type(tournament_id)})")
        return self.repo.find_games_by_tournament_id(tournament_id)

    def find_games_by_player_white_id(self, player_white_id: str) -> list[Game]:
        if not isinstance(player_white_id, str):
            raise ValueError(f"Expected type (str), but received ({type(player_white_id)})")
        return self.repo.find_games_by_player_white_id(player_white_id)

    def find_games_by_player_black_id(self, player_black_id: str) -> list[Game]:
        if not isinstance(player_black_id, str):
            raise ValueError(f"Expected type (str), but received ({type(player_black_id)})")
        return self.repo.find_games_by_player_black_id(player_black_id)

    def find_games_by_player_id(self, player_id: str) -> list[Game]:
        if not isinstance(player_id, str):
            raise ValueError(f"Expected type (str), but received ({type(player_id)})")
        return self.repo.find_games_by_player_id(player_id)

    def update_game_result(self, game_id: str, result: WinState) -> Game | None:
        if not isinstance(game_id, str):
            raise ValueError(f"Expected type (str) for game_id, but received ({type(game_id)})")
        if not isinstance(result, WinState):
            raise ValueError(f"Expected type (WinState) for result, but received ({type(result)})")
        return self.repo.update_game_result(game_id, result)

    def update_game_tournament_id(self, game_id: str, new_tournament_id: str) -> Game | None:
        if not isinstance(game_id, str):
            raise ValueError(f"Expected type (str) for game_id, but received ({type(game_id)})")
        if not isinstance(new_tournament_id, str):
            raise ValueError(f"Expected type (str) for new_tournament_id, but received ({type(new_tournament_id)})")
        return self.repo.update_game_tournament_id(game_id, new_tournament_id)

    def update_game_played_at(self, game_id: str, newDate: datetime) -> Game | None:
        if not isinstance(game_id, str):
            raise ValueError(f"Expected type (str) for game_id, but received ({type(game_id)})")
        if not isinstance(newDate, datetime):
            raise ValueError(f"Expected type (datetime) for newDate, but received ({type(newDate)})")
        return self.repo.update_game_played_at(game_id, newDate)

    def update_game_player_white_id(self, game_id: str, new_player_white_id: str) -> Game | None:
        if not isinstance(game_id, str):
            raise ValueError(f"Expected type (str) for game_id, but received ({type(game_id)})")
        if not isinstance(new_player_white_id, str):
            raise ValueError(
                f"Expected type (str) for new_player_white_id, but received ({type(new_player_white_id)})"
            )
        return self.repo.update_game_player_white_id(game_id, new_player_white_id)

    def update_game_player_black_id(self, game_id: str, new_player_black_id: str) -> Game | None:
        if not isinstance(game_id, str):
            raise ValueError(f"Expected type (str) for game_id, but received ({type(game_id)})")
        if not isinstance(new_player_black_id, str):
            raise ValueError(
                f"Expected type (str) for new_player_black_id, but received ({type(new_player_black_id)})"
            )
        return self.repo.update_game_player_black_id(game_id, new_player_black_id)

    def delete_game_by_id(self, game_id: str) -> str:
        if not isinstance(game_id, str):
            raise ValueError(f"Expected type (str), but received ({type(game_id)})")
        return self.repo.delete_game_by_id(game_id)
    
    #head to head stats between two players(Business Model)
    def get_head_to_head_stats(self, player1_id: str, player2_id: str) -> dict:
        if not isinstance(player1_id, str):
            raise ValueError(f"Expected type (str) for player1_id, but received ({type(player1_id)})")
        if not isinstance(player2_id, str):
            raise ValueError(f"Expected type (str) for player2_id, but received ({type(player2_id)})")

        stats = self.repo.get_head_to_head_stats(player1_id, player2_id)

        if not stats:
            return {"wins": 0, "losses": 0, "draws": 0}

        return {
            "wins": stats.wins or 0,
            "losses": stats.losses or 0,
            "draws": stats.draws or 0
        }
        
    #Record a game result(Business Model)
    def record_game_result(
        self,
        tournament_id: str,
        white_player_id: str,
        black_player_id: str,
        result: WinState
    ) -> Game:

        if not isinstance(tournament_id, str):
            raise ValueError("tournament_id must be str")
        if not isinstance(white_player_id, str):
            raise ValueError("white_player_id must be str")
        if not isinstance(black_player_id, str):
            raise ValueError("black_player_id must be str")
        if not isinstance(result, WinState):
            raise ValueError("result must be WinState")

        game = Game(
            tournament_id=tournament_id,
            player_white_id=white_player_id,
            player_black_id=black_player_id,
            result=result,
            played_at=datetime.utcnow()
        )

        self.repo.add_game(game)

        return game

