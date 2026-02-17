from datetime import datetime, date
from sqlalchemy import func, or_, text
from sqlalchemy.orm import Session
from src.repositories.game_repository_protocol import GameRepositoryProtocol
from src.domain.game import Game, WinState


class GameRepository(GameRepositoryProtocol):
    def __init__(self, session: Session):
        self.session = session

    def add_game(self, game: Game) -> str:
        self.session.add(game)
        self.session.commit()
        return f"Added game_id: {game.game_id}"

    def find_game_by_id(self, game_id: str) -> Game:
        game = self.session.get(Game, game_id)
        self.session.commit()
        self.session.refresh(game)
        return game

    def get_all_games(self) -> list[Game]:
        return self.session.query(Game).all()

    def find_games_by_played_date(self, played_date: date) -> list[Game]:
        return (
            self.session.query(Game)
            .filter(func.date(Game.played_at) == played_date)
            .all()
        )

    def find_games_by_result(self, result: WinState) -> list[Game]:
        return self.session.query(Game).filter(Game.result == result).all()

    def find_games_by_tournament_id(self, tournament_id: str) -> list[Game]:
        return self.session.query(Game).filter(Game.tournament_id == tournament_id).all()

    def find_games_by_player_white_id(self, player_white_id: str) -> list[Game]:
        return self.session.query(Game).filter(Game.player_white_id == player_white_id).all()

    def find_games_by_player_black_id(self, player_black_id: str) -> list[Game]:
        return self.session.query(Game).filter(Game.player_black_id == player_black_id).all()

    def find_games_by_player_id(self, player_id: str) -> list[Game]:
        return (
            self.session.query(Game)
            .filter(or_(Game.player_white_id == player_id, Game.player_black_id == player_id))
            .all()
        )

    def update_game_result(self, game_id: str, result: WinState) -> Game | None:
        game = self.session.get(Game, game_id)
        if not game:
            return None
        game.result = result
        self.session.commit()
        self.session.refresh(game)
        return game

    def update_game_tournament_id(self, game_id: str, new_tournament_id: str) -> Game | None:
        game = self.session.get(Game, game_id)
        if not game:
            return None
        game.tournament_id = new_tournament_id
        self.session.commit()
        self.session.refresh(game)
        return game

    def update_game_played_at(self, game_id: str, newDate: datetime) -> Game | None:
        game = self.session.get(Game, game_id)
        if not game:
            return None
        game.played_at = newDate
        self.session.commit()
        self.session.refresh(game)
        return game

    def update_game_player_white_id(self, game_id: str, new_player_white_id: str) -> Game | None:
        game = self.session.get(Game, game_id)
        if not game:
            return None
        game.player_white_id = new_player_white_id
        self.session.commit()
        self.session.refresh(game)
        return game

    def update_game_player_black_id(self, game_id: str, new_player_black_id: str) -> Game | None:
        game = self.session.get(Game, game_id)
        if not game:
            return None
        game.player_black_id = new_player_black_id
        self.session.commit()
        self.session.refresh(game)
        return game

    def delete_game_by_id(self, game_id: str) -> str | None:
        game = self.session.get(Game, game_id)
        if not game:
            return None
        self.session.delete(game)
        self.session.commit()
        return f"Deleted game_id: {game.game_id}"
    
    #function for head to head stats between two players(Business Model)
    def get_head_to_head_stats(self, player1_id: str, player2_id: str):
        query = text("""
        SELECT 
            SUM(CASE WHEN gp1.result = 'WIN' THEN 1 ELSE 0 END) AS wins,
            SUM(CASE WHEN gp1.result = 'LOSS' THEN 1 ELSE 0 END) AS losses,
            SUM(CASE WHEN gp1.result = 'DRAW' THEN 1 ELSE 0 END) AS draws
        FROM game_player gp1
        JOIN game_player gp2
            ON gp1.game_id = gp2.game_id
        WHERE gp1.player_id = :p1
          AND gp2.player_id = :p2
        """)

        return self.session.execute(
            query,
            {"p1": player1_id, "p2": player2_id}
        ).fetchone()

