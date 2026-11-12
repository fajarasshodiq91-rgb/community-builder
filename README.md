# Community Builder

AI-powered community infrastructure builder for solo creators.

**Product principle:** AI plans → creator approves → system executes.

## MVP scope
1. Guided creator discovery
2. Platform recommendation with rationale
3. Editable, platform-agnostic community blueprint
4. Explicit creator approval
5. Discord setup as the first execution adapter

Telegram, WhatsApp, analytics, and advanced automation are intentionally out of the first MVP.

## Tech stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth; add when persistence is implemented)
- Claude API (server-side only)
- Discord API through a dedicated bot/application
- Vercel deployment

## Getting started
1. Install Node.js 20.9+.
2. Copy `.env.example` to `.env.local`.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open http://localhost:3000.

The current scaffold is a product foundation, not a production-ready integration. No Discord actions are executed yet.

## Development rules
Read `CLAUDE.md` before making changes. Product requirements live in `docs/PRD.md`; architecture decisions live in `docs/ARCHITECTURE.md`.

## Security
Never expose Claude or Discord secrets in browser code. Never execute an AI-generated action without schema validation, permission checks, a human approval step, and an audit record.
