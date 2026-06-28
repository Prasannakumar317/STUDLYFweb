from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

from auth import build_auth_router
from workspace import build_workspace_router
from newsletter import build_newsletter_router
from conversations import build_conversations_router

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI(title="STUDLYF AI API")
api_router = APIRouter(prefix="/api")


# ---------- Public models ----------
class SignupCreate(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    company: Optional[str] = None
    role: Optional[str] = None
    source: Optional[str] = "landing-cta"


class SignupOut(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    created_at: datetime


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "STUDLYF AI API live"}


@api_router.post("/signup", response_model=SignupOut)
async def signup(payload: SignupCreate):
    existing = await db.signups.find_one({"email": payload.email}, {"_id": 0})
    if existing:
        return SignupOut(
            id=existing["id"],
            email=existing["email"],
            name=existing.get("name"),
            created_at=datetime.fromisoformat(existing["created_at"]) if isinstance(existing["created_at"], str) else existing["created_at"],
        )
    doc = {
        "id": str(uuid.uuid4()),
        "email": payload.email,
        "name": payload.name,
        "company": payload.company,
        "role": payload.role,
        "source": payload.source,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.signups.insert_one(doc)
    return SignupOut(
        id=doc["id"],
        email=doc["email"],
        name=doc.get("name"),
        created_at=datetime.fromisoformat(doc["created_at"]),
    )


SYSTEM_PROMPT = (
    "You are STUDLYF AI, the friendly product assistant for STUDLYF AI — "
    "an AI Business Growth Platform that helps founders, students, "
    "agencies, incubators, mentors and investors build, launch and scale startups. "
    "You can answer questions about features (Strategy, Marketing, Funding, Pitch Deck, VC Score, "
    "Market Research, Brand Builder, AI Agents), pricing tiers (Starter / Pro / Business / Enterprise), "
    "and use cases. Keep responses concise (3-5 sentences), warm, modern, and never invent prices. "
    "If asked about pricing details, tell them to check the Pricing section. End with a soft next-step."
)


@api_router.post("/chat")
async def chat_simple(req: ChatRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    session_id = req.session_id or str(uuid.uuid4())
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=SYSTEM_PROMPT,
    ).with_model("gemini", "gemini-3-flash-preview")
    full = ""
    try:
        async for ev in chat.stream_message(UserMessage(text=req.message)):
            if isinstance(ev, TextDelta):
                full += ev.content
            elif isinstance(ev, StreamDone):
                break
    except Exception as e:
        logger.exception("Chat failed")
        raise HTTPException(status_code=500, detail=str(e))
    return {"session_id": session_id, "reply": full}


app.include_router(api_router)

# Auth router (prefix /api/auth)
auth_router, get_user_from_request = build_auth_router(db)
app.include_router(auth_router)

# Workspace router (prefix /api/workspace)
workspace_router = build_workspace_router(db, get_user_from_request)
app.include_router(workspace_router)

# Newsletter router (prefix /api/newsletter)
newsletter_router = build_newsletter_router(db)
app.include_router(newsletter_router)

# Conversations router (prefix /api/workspace)
conversations_router = build_conversations_router(db, get_user_from_request)
app.include_router(conversations_router)


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
