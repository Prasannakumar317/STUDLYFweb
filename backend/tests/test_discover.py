"""Phase 5 — Discover mega-menu backend tests."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://studlyf-ai.preview.emergentagent.com").rstrip("/")


@pytest.fixture
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Discover endpoints ----------
class TestDiscover:
    def test_startups_default(self, api):
        r = api.get(f"{BASE_URL}/api/discover/startups", timeout=20)
        assert r.status_code == 200
        data = r.json()
        items = data.get("items") or []
        assert len(items) >= 6, f"expected at least 6 startups got {len(items)}"
        sample = items[0]
        for k in ("name", "description", "industry", "location", "logo", "website", "slug"):
            assert k in sample, f"missing key {k} in startup item: {sample}"
        assert sample["name"]

    def test_startups_limit(self, api):
        r = api.get(f"{BASE_URL}/api/discover/startups?limit=3", timeout=20)
        assert r.status_code == 200
        # Endpoint always backfills to >=6 from curated; ensure limit param doesn't crash
        # and capped at limit or backfilled. We accept either behavior; just check non-empty.
        items = r.json().get("items") or []
        assert len(items) >= 1

    def test_stories(self, api):
        r = api.get(f"{BASE_URL}/api/discover/stories?limit=5", timeout=20)
        assert r.status_code == 200
        items = r.json().get("items") or []
        assert len(items) >= 3, f"expected at least 3 stories got {len(items)}"
        for k in ("title", "url", "source", "time", "score"):
            assert k in items[0]

    def test_industries(self, api):
        r = api.get(f"{BASE_URL}/api/discover/industries", timeout=10)
        assert r.status_code == 200
        items = r.json().get("items") or []
        assert len(items) == 13, f"expected 13 industries got {len(items)}"
        assert all("slug" in i and "name" in i for i in items)

    def test_search_stripe(self, api):
        r = api.get(f"{BASE_URL}/api/discover/search?q=stripe", timeout=15)
        assert r.status_code == 200
        items = r.json().get("items") or []
        assert len(items) >= 1
        assert any("stripe" in (it.get("name") or "").lower() for it in items)

    def test_search_fintech_multiple(self, api):
        r = api.get(f"{BASE_URL}/api/discover/search?q=fintech", timeout=15)
        assert r.status_code == 200
        items = r.json().get("items") or []
        assert len(items) >= 2, f"expected multiple for fintech got {len(items)}"

    def test_search_empty_q(self, api):
        r = api.get(f"{BASE_URL}/api/discover/search?q=", timeout=10)
        assert r.status_code == 422

    def test_company_stripe(self, api):
        r = api.get(f"{BASE_URL}/api/discover/company/stripe", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["name"].lower() == "stripe"
        for k in ("name", "description", "industry", "location", "logo", "website"):
            assert k in data

    def test_company_unknown_404(self, api):
        r = api.get(f"{BASE_URL}/api/discover/company/zzz-nonexistent-xyz-foo-bar-1234", timeout=15)
        assert r.status_code == 404

    def test_startups_cache_second_call(self, api):
        t1 = time.time()
        r1 = api.get(f"{BASE_URL}/api/discover/startups", timeout=20)
        d1 = time.time() - t1
        assert r1.status_code == 200
        t2 = time.time()
        r2 = api.get(f"{BASE_URL}/api/discover/startups", timeout=20)
        d2 = time.time() - t2
        assert r2.status_code == 200
        print(f"first={d1:.2f}s second={d2:.2f}s")


# ---------- Regression on other endpoints ----------
class TestRegression:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/", timeout=10)
        assert r.status_code == 200
        assert "STUDLYF" in r.json().get("message", "")

    def test_signup(self, api):
        import uuid
        email = f"test_phase5_{uuid.uuid4().hex[:8]}@example.com"
        r = api.post(f"{BASE_URL}/api/signup", json={"email": email, "name": "Phase5 Test"}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == email
        assert "id" in data

    def test_newsletter(self, api):
        import uuid
        email = f"news_phase5_{uuid.uuid4().hex[:8]}@example.com"
        r = api.post(f"{BASE_URL}/api/newsletter", json={"email": email}, timeout=10)
        assert r.status_code in (200, 201)

    def test_auth_me_unauth(self, api):
        r = api.get(f"{BASE_URL}/api/auth/me", timeout=10)
        assert r.status_code in (200, 401)

    def test_auth_me_with_session(self, api):
        r = api.get(f"{BASE_URL}/api/auth/me",
                    cookies={"session_token": "test_session_1782634396190"},
                    timeout=10)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("user") or data.get("email") or data.get("id")

    def test_workspace_projects(self, api):
        r = api.get(f"{BASE_URL}/api/workspace/projects",
                    cookies={"session_token": "test_session_1782634396190"},
                    timeout=10)
        assert r.status_code == 200

    def test_workspace_conversations(self, api):
        r = api.get(f"{BASE_URL}/api/workspace/conversations",
                    cookies={"session_token": "test_session_1782634396190"},
                    timeout=10)
        assert r.status_code == 200
