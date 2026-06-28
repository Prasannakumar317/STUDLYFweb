"""Conversations & AI-chat workspace endpoints."""
import os
import uuid
import json
import re
import logging
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Cookie, Header
from pydantic import BaseModel
from typing import Optional, List

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
from schemas import build_prompt, KIND_LABELS

logger = logging.getLogger(__name__)
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

# System prompt for the AI Co-Founder chat
COFOUNDER_PROMPT = (
    "You are STUDLYF AI — the user's AI Business Co-Founder inside an AI Business Operating System. "
    "You help founders, students, agencies and investors build, launch and scale startups. "
    "Style: warm, direct, opinionated, structured. Aim for short paragraphs and rich Markdown — "
    "use bullet lists, **bold** for highlights, tables for comparisons, and fenced code blocks for any code. "
    "When a user describes a startup, remember everything — name, industry, stage, target audience, "
    "competitors, goals — and do NOT ask for the same information twice within a conversation. "
    "When relevant, end with a short call-to-action like 'Want me to draft the SWOT / pitch deck / "
    "marketing plan?'. Keep replies under ~300 words unless the user asks for more."
)


class ConversationCreate(BaseModel):
    title: Optional[str] = "New chat"


class ConversationUpdate(BaseModel):
    title: str


class MessageIn(BaseModel):
    text: str


class BootstrapIn(BaseModel):
    conversation_id: Optional[str] = None
    name: Optional[str] = None
    tagline: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None
    kinds: List[str] = ["swot", "go_to_market", "marketing_plan", "brand_strategy", "pitch_deck", "vc_score"]


def _parse_json_response(text: str) -> dict:
    t = text.strip()
    if t.startswith("```"):
        t = re.sub(r"^```[a-zA-Z]*\n?", "", t)
        t = re.sub(r"\n?```\s*$", "", t)
    try:
        return json.loads(t)
    except Exception:
        m = re.search(r"\{[\s\S]*\}", t)
        if m:
            return json.loads(m.group(0))
        raise


def build_conversations_router(db, get_user_from_request):
    router = APIRouter(prefix="/api/workspace", tags=["workspace-chat"])

    async def _require_user(session_token, authorization):
        user = await get_user_from_request(session_token, authorization)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        return user

    @router.get("/conversations")
    async def list_conversations(
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        items = await db.conversations.find({"user_id": user["user_id"]}, {"_id": 0, "messages": 0}).to_list(200)
        items.sort(key=lambda c: c.get("updated_at", c.get("created_at", "")), reverse=True)
        return items

    @router.post("/conversations")
    async def create_conversation(
        payload: ConversationCreate,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        cid = f"conv_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        doc = {
            "conversation_id": cid,
            "user_id": user["user_id"],
            "title": payload.title or "New chat",
            "messages": [],
            "created_at": now,
            "updated_at": now,
        }
        await db.conversations.insert_one(doc)
        doc.pop("_id", None)
        doc.pop("messages", None)
        return doc

    @router.get("/conversations/{conversation_id}")
    async def get_conversation(
        conversation_id: str,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        c = await db.conversations.find_one(
            {"conversation_id": conversation_id, "user_id": user["user_id"]}, {"_id": 0}
        )
        if not c:
            raise HTTPException(status_code=404, detail="Not found")
        return c

    @router.patch("/conversations/{conversation_id}")
    async def rename(
        conversation_id: str,
        payload: ConversationUpdate,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        res = await db.conversations.update_one(
            {"conversation_id": conversation_id, "user_id": user["user_id"]},
            {"$set": {"title": payload.title, "updated_at": datetime.now(timezone.utc).isoformat()}},
        )
        if res.matched_count == 0:
            raise HTTPException(status_code=404, detail="Not found")
        return {"ok": True}

    @router.delete("/conversations/{conversation_id}")
    async def delete_conv(
        conversation_id: str,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        res = await db.conversations.delete_one(
            {"conversation_id": conversation_id, "user_id": user["user_id"]}
        )
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Not found")
        return {"ok": True}

    @router.post("/conversations/{conversation_id}/messages")
    async def send_message(
        conversation_id: str,
        payload: MessageIn,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        conv = await db.conversations.find_one(
            {"conversation_id": conversation_id, "user_id": user["user_id"]}, {"_id": 0}
        )
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")

        now = datetime.now(timezone.utc).isoformat()
        user_msg = {"role": "user", "text": payload.text, "ts": now}

        # Build a transcript of the recent history to give the model real memory
        prior = conv.get("messages", [])[-20:]
        transcript_lines = []
        for m in prior:
            who = "User" if m.get("role") == "user" else "Assistant"
            transcript_lines.append(f"{who}: {m.get('text','')}")
        transcript = "\n".join(transcript_lines).strip()

        system_with_memory = COFOUNDER_PROMPT
        if transcript:
            system_with_memory += (
                "\n\nConversation memory so far (most recent first is at the bottom). "
                "Use this to remember the user's startup, industry, stage, goals and never re-ask:\n"
                f"---\n{transcript}\n---"
            )

        # session_id ties to conversation_id (a hint, not real persistence)
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=conversation_id,
            system_message=system_with_memory,
        ).with_model("gemini", "gemini-3-flash-preview")

        full = ""
        try:
            async for ev in chat.stream_message(UserMessage(text=payload.text)):
                if isinstance(ev, TextDelta):
                    full += ev.content
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logger.exception("AI chat failed")
            raise HTTPException(status_code=500, detail=str(e))

        ai_msg = {"role": "assistant", "text": full, "ts": datetime.now(timezone.utc).isoformat()}

        # auto-title from first user message if title is default
        new_title = conv["title"]
        if new_title == "New chat" and len(conv.get("messages", [])) == 0:
            new_title = (payload.text[:48] + ("…" if len(payload.text) > 48 else ""))

        await db.conversations.update_one(
            {"conversation_id": conversation_id},
            {"$push": {"messages": {"$each": [user_msg, ai_msg]}},
             "$set": {"updated_at": ai_msg["ts"], "title": new_title}},
        )
        return {"user_message": user_msg, "assistant_message": ai_msg, "title": new_title}

    EXTRACT_PROMPT = (
        "Given the following conversation between a founder and an AI co-founder, extract the "
        "startup details as a SINGLE JSON object — no prose, no fences. Schema:\n"
        '{ "name": str, "tagline": str (one-sentence positioning), "industry": str, '
        '"stage": "Idea"|"Validation"|"Pre-seed"|"Seed"|"Series A"|"Growth" }\n'
        "If a field is unclear, infer the most plausible value. NEVER return null — use a sensible default."
    )

    @router.post("/extract-startup")
    async def extract_startup(
        payload: dict,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await _require_user(session_token, authorization)
        conversation_id = payload.get("conversation_id")
        conv = await db.conversations.find_one(
            {"conversation_id": conversation_id, "user_id": user["user_id"]}, {"_id": 0}
        )
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        transcript = "\n\n".join(
            f"{m['role'].upper()}: {m['text']}" for m in conv.get("messages", [])
        )
        if not transcript.strip():
            raise HTTPException(status_code=400, detail="Conversation is empty")

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"extract-{conversation_id}",
            system_message="You output ONLY valid JSON. No markdown. No commentary.",
        ).with_model("gemini", "gemini-3-flash-preview")
        full = ""
        try:
            async for ev in chat.stream_message(UserMessage(text=EXTRACT_PROMPT + "\n\nConversation:\n" + transcript[-8000:])):
                if isinstance(ev, TextDelta):
                    full += ev.content
                elif isinstance(ev, StreamDone):
                    break
            data = _parse_json_response(full)
        except Exception as e:
            logger.warning(f"Extract failed: {e}; raw={full[:200]}")
            raise HTTPException(status_code=502, detail="Could not extract startup details. Try giving more context first.")
        return data

    @router.post("/bootstrap")
    async def bootstrap(
        payload: BootstrapIn,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        """Create a project from chat context. (Generations are run on-demand from the dashboard.)"""
        user = await _require_user(session_token, authorization)
        name = (payload.name or "").strip() or "My Startup"
        pid = f"proj_{uuid.uuid4().hex[:10]}"
        now = datetime.now(timezone.utc).isoformat()
        proj = {
            "project_id": pid,
            "user_id": user["user_id"],
            "name": name,
            "tagline": payload.tagline or "",
            "industry": payload.industry or "",
            "stage": payload.stage or "Idea",
            "created_at": now,
            "is_demo": False,
            "bootstrapped_from": payload.conversation_id,
        }
        await db.projects.insert_one(proj)
        proj.pop("_id", None)
        return {"project": proj}

    return router
