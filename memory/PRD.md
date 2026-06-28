# STUDLYF AI — Landing Page PRD

## Original Problem Statement
Build a premium SaaS landing page for **STUDLYF AI** — "The Complete AI Business Growth Platform" — that helps founders, students, agencies, incubators and investors transform ideas into successful businesses using AI-powered strategy, market intelligence, branding, marketing and investor tools.

## Architecture
- **Frontend**: React 19 + CRA + TailwindCSS + Framer Motion + shadcn/ui + lucide-react + react-icons
- **Backend**: FastAPI + Motor (MongoDB)
- **AI**: Emergent LLM Key → Gemini 3 Flash via `emergentintegrations` (chat widget)
- **Storage**: MongoDB — `signups` collection (Get Started flow)

## User Personas
1. **Founders / Startup teams** — primary CTA path
2. **Students & Pre-Incubators** — education vertical
3. **Incubators / Accelerators / Mentors** — institutional buyers
4. **Agencies** — service providers
5. **Investors / VCs** — diligence vertical

## Core Requirements (static)
- Light theme only · white background · gradient accents (purple→pink→orange)
- Glassmorphism cards · 24px radius · Apple-inspired minimalism
- Framer Motion animations everywhere · responsive mobile-first
- All interactive elements include `data-testid`

## What's Implemented (2026-06-28)
- Sticky Navbar (transparent → glass on scroll) with mobile menu
- Hero with animated AI dashboard mock (progress bars, agents, live activity, AI chat preview, floating cards)
- TrustedBy infinite marquee with brand icons
- 12-card Platform Features bento grid
- 6-card Solutions grid (Startups, Pre-Incubators, Incubators, Mentors, Agencies, Investors/VCs)
- 9-step AI Workflow timeline (animated gradient connector)
- 10 AI Agents grid with pulsing avatars
- Interactive Dashboard Preview (sidebar / center / right panels, animated SVG chart)
- Animated Metrics counters on gradient banner
- Testimonials carousel with dots
- Pricing (Starter / Pro / Business / Enterprise) with monthly/yearly toggle
- FAQ shadcn accordion (6 items)
- Blog preview (3 cards)
- Newsletter (mock success toast)
- Footer with social + 4 link columns
- Floating AI Chat widget (Gemini 3 Flash, full conversation UI)
- Signup Dialog (POST `/api/signup` → MongoDB, idempotent on email)

## Backend Endpoints
- `GET /api/` — health
- `POST /api/signup` — email capture, idempotent
- `POST /api/chat` — Gemini-powered chat (non-streaming)
- `POST /api/chat/stream` — SSE streaming variant (available, not used by widget)

## Backlog / Next
- P1: Make newsletter persist to MongoDB + double opt-in email
- P1: Wire "Watch Demo" to an actual video modal
- P1: Real auth (Emergent Google Auth) on Get Started instead of email capture
- P2: Multi-page app: real Strategy/Marketing/Funding modules behind login
- P2: i18n / locale switcher
- P2: Blog CMS (mdx or Notion API)
- P2: A/B test hero CTA copy + pricing layout

## Verified
- Backend: 6/6 pytest cases (TestHealth, TestSignup, TestChat) — see `/app/backend/tests/backend_test.py`
- Frontend: 10/10 critical UI flows via testing_agent_v3 (iteration_1)
