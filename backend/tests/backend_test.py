"""Backend tests for STUDLYF AI - Phase 3 (structured JSON outputs + dashboard).
Includes Phase 1/2 regression: root, auth, projects CRUD, newsletter."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")

TEST_TOKEN = "test_session_1782634396190"
TEST_USER_ID = "user_test_1782634396190"
SEED_PROJECT_ID = "proj_mqxihr9g"


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth():
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TEST_TOKEN}",
    })
    return s


# ---------- Phase-1/2 regression ----------
class TestRegression:
    def test_root_alive(self, api):
        r = api.get(f"{BASE_URL}/api/", timeout=10)
        assert r.status_code == 200
        assert r.json().get("message") == "STUDLYF AI API live"

    def test_signup_idempotent(self, api):
        email = f"TEST_reg_{uuid.uuid4().hex[:8]}@example.com"
        p = {"name": "R", "email": email, "company": "C", "role": "Founder"}
        r1 = api.post(f"{BASE_URL}/api/signup", json=p, timeout=15)
        r2 = api.post(f"{BASE_URL}/api/signup", json=p, timeout=15)
        assert r1.status_code == 200 and r2.status_code == 200
        assert r1.json()["id"] == r2.json()["id"]

    def test_me_without_token_401(self, api):
        r = api.get(f"{BASE_URL}/api/auth/me", timeout=10)
        assert r.status_code == 401

    def test_me_with_bearer(self, auth):
        r = auth.get(f"{BASE_URL}/api/auth/me", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["user_id"] == TEST_USER_ID

    def test_chat_regression(self, api):
        r = api.post(f"{BASE_URL}/api/chat",
                     json={"message": "Reply in 1 sentence."}, timeout=60)
        assert r.status_code == 200
        assert isinstance(r.json().get("reply"), str)


# ---------- Workspace: Projects CRUD ----------
class TestProjects:
    def test_list_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/workspace/projects", timeout=10)
        assert r.status_code == 401

    def test_seeded_project_present(self, auth):
        r = auth.get(f"{BASE_URL}/api/workspace/projects", timeout=10)
        assert r.status_code == 200
        ids = [p["project_id"] for p in r.json()]
        assert SEED_PROJECT_ID in ids

    def test_crud_cycle(self, auth):
        payload = {"name": f"TEST_Proj_{uuid.uuid4().hex[:6]}",
                   "tagline": "x", "industry": "SaaS", "stage": "Idea"}
        rc = auth.post(f"{BASE_URL}/api/workspace/projects", json=payload, timeout=15)
        assert rc.status_code == 200
        pid = rc.json()["project_id"]
        ru = auth.patch(f"{BASE_URL}/api/workspace/projects/{pid}",
                        json={"tagline": "updated"}, timeout=10)
        assert ru.status_code == 200 and ru.json()["tagline"] == "updated"
        rd = auth.delete(f"{BASE_URL}/api/workspace/projects/{pid}", timeout=10)
        assert rd.status_code == 200


# ---------- Phase 3: Structured JSON generation ----------
_generated_ids: list[str] = []


def _gen(auth, kind: str, retries: int = 1):
    """Generate with one retry on 502 (model JSON variance)."""
    last_resp = None
    for attempt in range(retries + 1):
        r = auth.post(f"{BASE_URL}/api/workspace/generate",
                      json={"project_id": SEED_PROJECT_ID, "kind": kind},
                      timeout=120)
        last_resp = r
        if r.status_code == 200:
            return r
        if r.status_code == 502:
            continue
        break
    return last_resp


class TestStructuredGeneration:
    """POST /api/workspace/generate must return {data: dict, raw: str, label: str}."""

    def _common_assertions(self, body, kind):
        assert body["kind"] == kind
        assert body["project_id"] == SEED_PROJECT_ID
        assert body["user_id"] == TEST_USER_ID
        assert isinstance(body.get("label"), str) and len(body["label"]) > 0
        assert isinstance(body.get("raw"), str) and len(body["raw"]) > 20
        assert isinstance(body.get("data"), dict) and len(body["data"]) > 0
        assert "generation_id" in body
        # legacy 'content' field should NOT be the primary contract anymore
        # (we don't fail if present, but data must exist)

    def test_swot_shape(self, auth):
        r = _gen(auth, "swot")
        assert r.status_code == 200, r.text
        body = r.json()
        self._common_assertions(body, "swot")
        d = body["data"]
        # SWOT top-level keys
        for k in ("strengths", "weaknesses", "opportunities", "threats"):
            assert isinstance(d.get(k), list) and len(d[k]) >= 3, f"swot.{k} missing/short"
        assert isinstance(d.get("scores"), dict)
        assert isinstance(d["scores"].get("overall"), (int, float))
        _generated_ids.append(body["generation_id"])

    def test_vc_score_shape(self, auth):
        r = _gen(auth, "vc_score")
        assert r.status_code == 200, r.text
        body = r.json()
        self._common_assertions(body, "vc_score")
        d = body["data"]
        assert isinstance(d.get("overall_score"), (int, float))
        assert d.get("recommendation", "").upper() in {"INVEST", "WATCH", "PASS"}
        assert isinstance(d.get("dimensions"), list) and len(d["dimensions"]) >= 3
        _generated_ids.append(body["generation_id"])

    def test_pitch_deck_shape(self, auth):
        r = _gen(auth, "pitch_deck")
        assert r.status_code == 200, r.text
        body = r.json()
        self._common_assertions(body, "pitch_deck")
        d = body["data"]
        slides = d.get("slides") or []
        assert isinstance(slides, list) and len(slides) >= 10, f"expected ~14 slides, got {len(slides)}"
        # Each slide must have n and title
        assert all("n" in s and "title" in s for s in slides[:5])
        assert isinstance(d.get("score"), (int, float))
        _generated_ids.append(body["generation_id"])

    def test_marketing_plan_shape(self, auth):
        r = _gen(auth, "marketing_plan")
        assert r.status_code == 200, r.text
        body = r.json()
        self._common_assertions(body, "marketing_plan")
        d = body["data"]
        assert isinstance(d.get("scores"), dict)
        assert isinstance(d["scores"].get("overall"), (int, float))
        assert isinstance(d.get("channels"), list) and len(d["channels"]) >= 3
        _generated_ids.append(body["generation_id"])

    def test_brand_strategy_shape(self, auth):
        r = _gen(auth, "brand_strategy")
        assert r.status_code == 200, r.text
        body = r.json()
        self._common_assertions(body, "brand_strategy")
        d = body["data"]
        assert isinstance(d.get("score"), (int, float))
        assert isinstance(d.get("palette"), list) and len(d["palette"]) >= 3
        assert isinstance(d.get("personality"), list) and len(d["personality"]) >= 3
        _generated_ids.append(body["generation_id"])

    def test_invalid_kind_422(self, auth):
        r = auth.post(f"{BASE_URL}/api/workspace/generate",
                      json={"project_id": SEED_PROJECT_ID, "kind": "garbage"}, timeout=15)
        assert r.status_code == 422

    def test_generate_requires_auth(self, api):
        r = api.post(f"{BASE_URL}/api/workspace/generate",
                     json={"project_id": SEED_PROJECT_ID, "kind": "swot"}, timeout=15)
        assert r.status_code == 401

    def test_unknown_project_404(self, auth):
        r = auth.post(f"{BASE_URL}/api/workspace/generate",
                      json={"project_id": "proj_doesnotexist", "kind": "swot"}, timeout=30)
        assert r.status_code == 404


# ---------- Phase 3: Dashboard aggregator ----------
class TestDashboard:
    def test_dashboard_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/workspace/dashboard", timeout=10)
        assert r.status_code == 401

    def test_dashboard_with_project(self, auth):
        r = auth.get(f"{BASE_URL}/api/workspace/dashboard",
                     params={"project_id": SEED_PROJECT_ID}, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("project", {}).get("project_id") == SEED_PROJECT_ID
        assert isinstance(d.get("scores"), dict)
        for k in ("business_health", "vc_score", "marketing", "brand", "pitch", "overall_ai"):
            assert k in d["scores"], f"missing dashboard score key: {k}"
        assert isinstance(d.get("counts"), dict)
        assert "generations" in d["counts"] and "unique_tools" in d["counts"]
        assert isinstance(d.get("latest"), list)

    def test_dashboard_aggregates_after_generations(self, auth):
        # After Phase 3 generations above (swot/vc/pitch/marketing/brand),
        # overall_ai should be a number now.
        r = auth.get(f"{BASE_URL}/api/workspace/dashboard",
                     params={"project_id": SEED_PROJECT_ID}, timeout=15)
        assert r.status_code == 200
        d = r.json()
        # At least one of the 5 component scores should be present (the swot test always runs first)
        comp = d["scores"]
        any_defined = any(isinstance(comp.get(k), (int, float))
                          for k in ("business_health", "vc_score", "marketing", "brand", "pitch"))
        assert any_defined, f"Expected at least one score, got {comp}"
        if any_defined:
            assert isinstance(comp["overall_ai"], (int, float))

    def test_dashboard_no_project_id_fallback(self, auth):
        # Without project_id, should fall back to first project of user (seeded user has Lumen Labs)
        r = auth.get(f"{BASE_URL}/api/workspace/dashboard", timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        # Either a project is returned, or scores/latest are empty (user has projects so should be the former)
        assert "scores" in d

    def test_dashboard_unknown_project_404(self, auth):
        r = auth.get(f"{BASE_URL}/api/workspace/dashboard",
                     params={"project_id": "proj_doesnotexist"}, timeout=10)
        assert r.status_code == 404


# ---------- Generations list/delete ----------
class TestGenerationsCrud:
    def test_list_filtered(self, auth):
        r = auth.get(f"{BASE_URL}/api/workspace/generations",
                     params={"project_id": SEED_PROJECT_ID}, timeout=15)
        assert r.status_code == 200
        items = r.json()
        for it in items:
            assert it["project_id"] == SEED_PROJECT_ID
            # Phase 3: every record should have data (dict)
            assert isinstance(it.get("data"), dict)

    def test_delete_one_generation(self, auth):
        if not _generated_ids:
            pytest.skip("No generation to delete")
        gid = _generated_ids[0]
        rd = auth.delete(f"{BASE_URL}/api/workspace/generations/{gid}", timeout=10)
        assert rd.status_code == 200
        rd2 = auth.delete(f"{BASE_URL}/api/workspace/generations/{gid}", timeout=10)
        assert rd2.status_code == 404


# ---------- Phase 4: Conversations + Bootstrap ----------
class TestConversations:
    """POST/GET/PATCH/DELETE /api/workspace/conversations + messages + extract-startup + bootstrap"""

    def test_conv_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/workspace/conversations", timeout=10)
        assert r.status_code == 401
        r2 = api.post(f"{BASE_URL}/api/workspace/conversations", json={}, timeout=10)
        assert r2.status_code == 401

    def test_create_list_get_patch_delete(self, auth):
        # CREATE
        r = auth.post(f"{BASE_URL}/api/workspace/conversations",
                      json={"title": "TEST_phase4"}, timeout=15)
        assert r.status_code == 200, r.text
        c = r.json()
        cid = c["conversation_id"]
        assert c["title"] == "TEST_phase4"
        # LIST (must NOT include messages array per spec)
        rl = auth.get(f"{BASE_URL}/api/workspace/conversations", timeout=15)
        assert rl.status_code == 200
        items = rl.json()
        assert any(i["conversation_id"] == cid for i in items)
        for i in items:
            assert "messages" not in i
        # GET single (must include messages)
        rg = auth.get(f"{BASE_URL}/api/workspace/conversations/{cid}", timeout=15)
        assert rg.status_code == 200
        single = rg.json()
        assert "messages" in single
        assert isinstance(single["messages"], list)
        # PATCH rename
        rp = auth.patch(f"{BASE_URL}/api/workspace/conversations/{cid}",
                        json={"title": "TEST_renamed"}, timeout=15)
        assert rp.status_code == 200
        rg2 = auth.get(f"{BASE_URL}/api/workspace/conversations/{cid}", timeout=15)
        assert rg2.json()["title"] == "TEST_renamed"
        # DELETE
        rd = auth.delete(f"{BASE_URL}/api/workspace/conversations/{cid}", timeout=15)
        assert rd.status_code == 200
        rg3 = auth.get(f"{BASE_URL}/api/workspace/conversations/{cid}", timeout=15)
        assert rg3.status_code == 404

    def test_message_flow_and_memory(self, auth):
        """Send 2 messages establishing a startup name, then ask 'what is my startup called?'."""
        rc = auth.post(f"{BASE_URL}/api/workspace/conversations",
                       json={"title": "TEST_memory"}, timeout=15)
        cid = rc.json()["conversation_id"]
        try:
            # Msg 1
            r1 = auth.post(f"{BASE_URL}/api/workspace/conversations/{cid}/messages",
                           json={"text": "I'm building a startup called PixelForge AI — an AI design assistant for indie founders."},
                           timeout=120)
            assert r1.status_code == 200, r1.text
            b1 = r1.json()
            assert b1["user_message"]["role"] == "user"
            assert b1["assistant_message"]["role"] == "assistant"
            assert len(b1["assistant_message"]["text"]) > 5
            # auto-title from first user message
            assert b1["title"] != "New chat"
            # Msg 2
            r2 = auth.post(f"{BASE_URL}/api/workspace/conversations/{cid}/messages",
                           json={"text": "It's pre-seed and targets solo SaaS founders."},
                           timeout=120)
            assert r2.status_code == 200
            # Memory probe
            r3 = auth.post(f"{BASE_URL}/api/workspace/conversations/{cid}/messages",
                           json={"text": "What is my startup called? Reply in one short sentence."},
                           timeout=120)
            assert r3.status_code == 200
            reply = r3.json()["assistant_message"]["text"].lower()
            assert "pixelforge" in reply, f"AI didn't remember startup name. Got: {reply[:200]}"
            # Conversation persists 6 messages
            rg = auth.get(f"{BASE_URL}/api/workspace/conversations/{cid}", timeout=15)
            assert len(rg.json()["messages"]) == 6
        finally:
            auth.delete(f"{BASE_URL}/api/workspace/conversations/{cid}", timeout=10)

    def test_extract_startup_empty_returns_4xx(self, auth):
        """Empty conversation -> 400 per spec."""
        rc = auth.post(f"{BASE_URL}/api/workspace/conversations",
                       json={"title": "TEST_empty"}, timeout=10)
        cid = rc.json()["conversation_id"]
        try:
            r = auth.post(f"{BASE_URL}/api/workspace/extract-startup",
                          json={"conversation_id": cid}, timeout=15)
            assert r.status_code == 400, f"expected 400 for empty conv, got {r.status_code}: {r.text}"
        finally:
            auth.delete(f"{BASE_URL}/api/workspace/conversations/{cid}", timeout=10)

    def test_extract_startup_and_bootstrap(self, auth):
        rc = auth.post(f"{BASE_URL}/api/workspace/conversations",
                       json={"title": "TEST_extract"}, timeout=15)
        cid = rc.json()["conversation_id"]
        created_pid = None
        try:
            auth.post(f"{BASE_URL}/api/workspace/conversations/{cid}/messages",
                      json={"text": "My startup is NovaMail — an AI cold-email tool for B2B sales teams. We're at pre-seed."},
                      timeout=120)
            r = auth.post(f"{BASE_URL}/api/workspace/extract-startup",
                          json={"conversation_id": cid}, timeout=60)
            assert r.status_code == 200, r.text
            d = r.json()
            for k in ("name", "tagline", "industry", "stage"):
                assert k in d and isinstance(d[k], str) and len(d[k]) > 0, f"missing {k} in {d}"
            # Bootstrap creates a real project
            rb = auth.post(f"{BASE_URL}/api/workspace/bootstrap",
                           json={"conversation_id": cid, **d}, timeout=30)
            assert rb.status_code == 200, rb.text
            proj = rb.json()["project"]
            assert proj["name"] == d["name"]
            assert proj["bootstrapped_from"] == cid
            assert proj["user_id"] == TEST_USER_ID
            created_pid = proj["project_id"]
            # Verify persistence: GET workspace/projects
            rp = auth.get(f"{BASE_URL}/api/workspace/projects", timeout=15)
            assert any(p["project_id"] == created_pid for p in rp.json())
        finally:
            auth.delete(f"{BASE_URL}/api/workspace/conversations/{cid}", timeout=10)
            if created_pid:
                auth.delete(f"{BASE_URL}/api/workspace/projects/{created_pid}", timeout=10)

    def test_extract_startup_unknown_conv_404(self, auth):
        r = auth.post(f"{BASE_URL}/api/workspace/extract-startup",
                      json={"conversation_id": "conv_doesnotexist"}, timeout=15)
        assert r.status_code == 404

    def test_bootstrap_requires_auth(self, api):
        r = api.post(f"{BASE_URL}/api/workspace/bootstrap",
                     json={"name": "X"}, timeout=10)
        assert r.status_code == 401
