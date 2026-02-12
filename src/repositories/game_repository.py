from sqlalchemy.orm import Session
from src.repositories.game_repository_protocol import GameRepositoryProtocol
from src.domain.game import Game, WinState

class GameRepository(GameRepositoryProtocol):
    def __init__(self, session: Session):
        self.session = session

    def add_game(self, game: Game) -> str:
        self.session.add(game)
        self.session.commit()
        return str(game.game_id)

    def find_game_by_id(self, game_id: str) -> Game:
        game = self.session.get(Game, game_id)
        if not game:
            raise Exception("Book not found")
        self.session.commit()
        self.session.refresh(game)
        return game

    def get_all_games(self) -> list[Game]:
        return self.session.query(Game).all()

    def update_game_result(self, game_id: str, result: WinState) -> Game:
        game = self.session.get(Game, game_id)
        if not game:
            raise Exception("Game not found")
        game.result = result
        self.session.commit()
        self.session.refresh(game)
        return game

    def delete_game_by_id(self, uuid: str) -> str: ...
