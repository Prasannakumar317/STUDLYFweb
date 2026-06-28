"""Backend API tests for STUDLYF AI landing page."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://studlyf-ai.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health ----------
class TestHealth:
    def test_root_alive(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data.get("message") == "STUDLYF AI API live"


# ---------- Signup ----------
class TestSignup:
    def test_signup_creates_record(self, api_client):
        email = f"TEST_{uuid.uuid4().hex[:10]}@example.com"
        payload = {"name": "Test User", "email": email, "company": "TestCo", "role": "Founder"}
        r = api_client.post(f"{BASE_URL}/api/signup", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert data["email"] == email
        assert data.get("name") == "Test User"
        assert "created_at" in data

    def test_signup_idempotent_same_email(self, api_client):
        email = f"TEST_idem_{uuid.uuid4().hex[:8]}@example.com"
        payload = {"name": "First", "email": email, "company": "A", "role": "Founder"}
        r1 = api_client.post(f"{BASE_URL}/api/signup", json=payload, timeout=15)
        assert r1.status_code == 200
        id1 = r1.json()["id"]

        # Second call with same email -> should return existing id
        payload2 = {"name": "Second", "email": email, "company": "B", "role": "Student"}
        r2 = api_client.post(f"{BASE_URL}/api/signup", json=payload2, timeout=15)
        assert r2.status_code == 200
        id2 = r2.json()["id"]
        assert id1 == id2, "Signup should be idempotent by email"

    def test_signup_invalid_email(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/signup", json={"email": "not-an-email"}, timeout=10)
        assert r.status_code in (400, 422)

    def test_signup_minimal_payload(self, api_client):
        email = f"TEST_min_{uuid.uuid4().hex[:8]}@example.com"
        r = api_client.post(f"{BASE_URL}/api/signup", json={"email": email}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == email
        assert "id" in data


# ---------- Chat ----------
class TestChat:
    def test_chat_returns_reply(self, api_client):
        payload = {"message": "In 1 sentence, what is STUDLYF AI?", "session_id": f"test-{uuid.uuid4().hex[:6]}"}
        r = api_client.post(f"{BASE_URL}/api/chat", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "reply" in data
        assert isinstance(data["reply"], str)
        assert len(data["reply"].strip()) > 0, "Reply should not be empty"
        assert "session_id" in data
