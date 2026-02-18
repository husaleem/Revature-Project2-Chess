import uuid
from fastapi.testclient import TestClient

from src import main as app_module
from src.main import app
from src.api.player_endpoints import get_player_service
from src.domain.exceptions import NotFoundError, ValidationError, ConflictError


class FakePlayerService:
    def __init__(self):
        self._id = str(uuid.uuid4())

    def add(self, player):
        return self._id

    def replace(self, player_id, player):
        return player_id

    def get_all(self):
        return [
            {
                "player_id": self._id,
                "first_name": "Jane",
                "last_name": "Doe",
                "rating": 1500,
            }
        ]

    def get_by_first_name(self, first_name):
        return self.get_all()

    def get_by_last_name(self, last_name):
        return self.get_all()

    def get_by_full_name(self, first_name, last_name):
        return self.get_all()

    def get_by_rating(self, rating):
        return self.get_all()

    def get_by_rating_range(self, lower, upper):
        return self.get_all()

    def get_by_id(self, player_id):
        return {
            "player_id": player_id,
            "first_name": "Jane",
            "last_name": "Doe",
            "rating": 1500,
        }

    def update_first_name_by_id(self, player_id, first_name):
        p = self.get_by_id(player_id)
        p["first_name"] = first_name
        return p

    def update_last_name_by_id(self, player_id, last_name):
        p = self.get_by_id(player_id)
        p["last_name"] = last_name
        return p

    def update_full_name_by_id(self, player_id, first_name, last_name):
        p = self.get_by_id(player_id)
        p["first_name"] = first_name
        p["last_name"] = last_name
        return p

    def update_rating_by_id(self, player_id, rating):
        p = self.get_by_id(player_id)
        p["rating"] = rating
        return p

    def delete_by_id(self, player_id):
        return self.get_by_id(player_id)


class RaisingPlayerService(FakePlayerService):
    def __init__(self, exc):
        super().__init__()
        self.exc = exc

    def add(self, player):
        raise self.exc

    def get_by_id(self, player_id):
        raise self.exc

    def replace(self, player_id, player):
        raise self.exc


class FakeGamePlayerService:
    def __init__(self):
        self.sample = {"game_id": 1, "player_id": 2, "color": "white", "result": "win"}

    def create_game_player(self, db, dto):
        return self.sample

    def get_all_game_players(self, db):
        return [self.sample]

    def delete_game_player(self, db, game_id, player_id):
        # return truthy for success, falsy for not found
        if game_id == 1 and player_id == 2:
            return True
        return False


def setup_player_override(svc):
    app.dependency_overrides[get_player_service] = lambda: svc


def clear_overrides():
    app.dependency_overrides.clear()


def test_create_player_and_get_all():
    fake_svc = FakePlayerService()
    setup_player_override(fake_svc)

    client = TestClient(app)

    payload = {"first_name": "Jane", "last_name": "Doe", "rating": 1500}
    resp = client.post("/players/add", json=payload)
    assert resp.status_code == 200
    assert resp.json() == fake_svc._id

    resp = client.get("/players/search/all")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list) and len(data) == 1
    assert data[0]["player_id"] == fake_svc._id

    clear_overrides()


def test_replace_player_returns_id():
    svc = FakePlayerService()
    setup_player_override(svc)
    client = TestClient(app)

    payload = {"first_name": "A", "last_name": "B", "rating": 1200}
    resp = client.put(f"/players/replace/by-id?player_id={svc._id}", json=payload)
    assert resp.status_code == 200
    assert resp.json() == svc._id
    clear_overrides()


def test_get_by_first_name():
    svc = FakePlayerService()
    setup_player_override(svc)
    client = TestClient(app)
    resp = client.get("/players/search/by-first-name?first_name=Jane")
    assert resp.status_code == 200
    clear_overrides()


def test_get_by_last_name():
    svc = FakePlayerService()
    setup_player_override(svc)
    client = TestClient(app)
    resp = client.get("/players/search/by-last-name?last_name=Doe")
    assert resp.status_code == 200
    clear_overrides()


def test_get_by_full_name():
    svc = FakePlayerService()
    setup_player_override(svc)
    client = TestClient(app)
    resp = client.get("/players/search/by-full-name?first_name=Jane&last_name=Doe")
    assert resp.status_code == 200
    clear_overrides()


def test_get_by_rating():
    svc = FakePlayerService()
    setup_player_override(svc)
    client = TestClient(app)
    resp = client.get("/players/search/by-rating?rating=1500")
    assert resp.status_code == 200
    clear_overrides()


def test_get_by_rating_range():
    svc = FakePlayerService()
    setup_player_override(svc)
    client = TestClient(app)
    resp = client.get("/players/search/by-rating-range?rating_lower=1000&rating_upper=2000")
    assert resp.status_code == 200
    clear_overrides()


def test_get_by_id():
    svc = FakePlayerService()
    setup_player_override(svc)
    client = TestClient(app)
    resp = client.get(f"/players/search/by-id?player_id={svc._id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["player_id"] == svc._id
    clear_overrides()


def test_update_first_name_by_id():
    svc = FakePlayerService()
    setup_player_override(svc)
    client = TestClient(app)
    resp = client.patch(f"/players/update/first-name-by-id?player_id={svc._id}&first_name=Janet")
    assert resp.status_code == 200
    assert resp.json()["first_name"] == "Janet"
    clear_overrides()


def test_update_last_name_by_id():
    svc = FakePlayerService()
    setup_player_override(svc)
    client = TestClient(app)
    resp = client.patch(f"/players/update/last-name-by-id?player_id={svc._id}&last_name=Smith")
    assert resp.status_code == 200
    assert resp.json()["last_name"] == "Smith"
    clear_overrides()


def test_update_full_name_by_id():
    svc = FakePlayerService()
    setup_player_override(svc)
    client = TestClient(app)
    resp = client.patch(
        f"/players/update/full-name-by-id?player_id={svc._id}&first_name=New&last_name=Name"
    )
    assert resp.status_code == 200
    j = resp.json()
    assert j["first_name"] == "New" and j["last_name"] == "Name"
    clear_overrides()


def test_update_rating_by_id():
    svc = FakePlayerService()
    setup_player_override(svc)
    client = TestClient(app)
    resp = client.patch(f"/players/update/rating-by-id?player_id={svc._id}&rating=1600")
    assert resp.status_code == 200
    assert resp.json()["rating"] == 1600
    clear_overrides()


def test_delete_by_id():
    svc = FakePlayerService()
    setup_player_override(svc)
    client = TestClient(app)
    resp = client.delete(f"/players/delete/by-id?player_id={svc._id}")
    assert resp.status_code == 200
    clear_overrides()


def test_create_game_player_and_get_all_and_delete():
    fake_gp = FakeGamePlayerService()

    # patch the module-level service in src.main
    original = app_module.game_player_service
    app_module.game_player_service = fake_gp

    client = TestClient(app)
    payload = {"game_id": 1, "player_id": 2, "color": "white", "result": "win"}
    resp = client.post("/game-players", json=payload)
    assert resp.status_code == 200
    assert resp.json()["game_id"] == 1

    resp = client.get("/game-players")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

    # successful delete
    resp = client.delete("/game-players/1/2")
    assert resp.status_code == 200

    # not-found delete
    resp = client.delete("/game-players/999/999")
    assert resp.status_code == 404

    # restore original
    app_module.game_player_service = original


def test_get_by_id_not_found_raises_404():
    svc = RaisingPlayerService(NotFoundError("nope"))
    setup_player_override(svc)
    client = TestClient(app)
    resp = client.get(f"/players/search/by-id?player_id={svc._id}")
    assert resp.status_code == 404
    assert "nope" in resp.json().get("detail", "")
    clear_overrides()


def test_create_player_validation_error_returns_400():
    svc = RaisingPlayerService(ValidationError("bad input"))
    setup_player_override(svc)
    client = TestClient(app)
    payload = {"first_name": "x", "last_name": "y"}
    resp = client.post("/players/add", json=payload)
    assert resp.status_code == 400
    assert "bad input" in resp.json().get("detail", "")
    clear_overrides()


def test_replace_player_conflict_returns_409():
    svc = RaisingPlayerService(ConflictError("conflict"))
    setup_player_override(svc)
    client = TestClient(app)
    payload = {"first_name": "A", "last_name": "B", "rating": 100}
    resp = client.put(f"/players/replace/by-id?player_id={svc._id}", json=payload)
    assert resp.status_code == 409
    assert "conflict" in resp.json().get("detail", "")
    clear_overrides()


