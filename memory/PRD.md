# STUDLYF AI — PRD

## Vision
Premium AI Business Operating System: marketing landing → authenticated workspace whose first screen is a **premium AI Co-Founder chat**, with a full BI dashboard one click away. Every AI module returns a structured **visual dashboard** (charts, KPIs, score rings) — never plain text.

## Architecture
- **Frontend**: React 19 + CRA + Tailwind + Framer Motion + shadcn/ui + lucide-react + Recharts + react-markdown + react-router-dom
- **Backend**: FastAPI + Motor + modular routers (auth, workspace, conversations, newsletter)
- **AI**: Emergent LLM Key → Gemini 3 Flash via `emergentintegrations`. Structured JSON outputs per kind-schema for modules; full transcript replay for chat memory.
- **Email**: Resend (test mode for unverified inboxes)
- **Auth**: Emergent-managed Google OAuth (httpOnly cookie + Bearer fallback)
- **MongoDB**: users, user_sessions, signups, newsletter, projects, generations, conversations

## Routing
- `/` — landing
- `/workspace` — **AI Co-Founder chat workspace** (post-login default)
- `/workspace/dashboard` — BI Dashboard (overall AI score + module scorecards)
- `/workspace/projects` — Projects CRUD
- `/workspace/strategy|marketing|funding` — visual generation modules
- `/workspace/documents|analytics|settings`

## Phases delivered
1. **Landing** — sticky nav, hero w/ animated dashboard mock, 12 features, 6 solutions, workflow, 10 agents, dashboard preview, metrics, testimonials, pricing, FAQ, blog, newsletter, footer, floating Gemini chat widget, signup dialog.
2. **Auth + Workspace shell** — Watch Demo modal, Newsletter→MongoDB+Resend, Emergent Google OAuth, demo project seeded, workspace shell with sidebar.
3. **Visual BI Dashboard** — every `/api/workspace/generate` returns structured JSON; 10 chart-rich renderers (SWOT matrix, BMC grid, GTM funnel, Marketing Plan, Brand wheel, Personas, Competitor matrix, 1-Min Pitch timeline, **14-slide Pitch Deck viewer with Present mode**, VC Score gauge). Dashboard Home with aggregated Overall AI Score + 5 score rings + sparklines.
4. **Premium AI Chat Workspace** — `/workspace` redesigned as AI Co-Founder chat:
   - Greeting hero + gradient headline
   - 10 quick-start cards
   - ~15 suggested-prompt pills
   - Conversation history sidebar (multiple named convs)
   - Markdown chat with tables/code, copy/regen/like/dislike, thinking-state bubble
   - Smart input — multi-line textarea, file-attachment chips (UI-only), Web Speech voice
   - Right sidebar — AI Assistant gradient card, 6-ring Business Scorecard, Quick Actions
   - Floating AI Orb with 6 colored shortcuts
   - **Build my workspace** flow — `/extract-startup` (Gemini extracts name/tagline/industry/stage) → `/bootstrap` (creates project) → success card → "Open my dashboard"
   - **AI memory** — last 20 messages of the conversation are replayed into the system prompt each request, so the assistant remembers the user's startup, industry and stage across turns.

## Backend Endpoints
- `/api/`, `/api/signup`, `/api/chat`, `/api/newsletter`
- `/api/auth/session|me|logout`
- `/api/workspace/projects` (CRUD)
- `/api/workspace/generate`, `/api/workspace/generations`
- `/api/workspace/dashboard`
- `/api/workspace/conversations` (CRUD + `{id}/messages`), `/api/workspace/extract-startup`, `/api/workspace/bootstrap`

## Verified
- iteration_1 (Phase 1): 6/6 backend + 10/10 frontend
- iteration_2 (Phase 2): 19/19 backend + 100% frontend
- iteration_3 (Phase 3): 22/22 backend + 100% frontend
- iteration_4 (Phase 4): 19/20 backend + 100% frontend → **memory bug fixed**, verified manually with curl

## Backlog
- P1: Real demo MP4 (set `REACT_APP_DEMO_VIDEO_URL`)
- P1: Verify Resend domain so welcome emails reach all subscribers
- P1: Real time-series sparklines on BI Dashboard (currently synthetic Math.sin)
- P2: Streaming chat responses (SSE) for faster perceived latency
- P2: File attachment parsing (extract text from PDF/DOCX/PPTX)
- P2: Real PPTX/Google Slides export of Pitch Deck
- P2: Stripe checkout from Pricing, team workspaces, i18n
