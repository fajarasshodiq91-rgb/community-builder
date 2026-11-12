# Claude Code Instructions — Community Builder

## Product context
Community Builder helps solo creators design and operate community infrastructure across existing platforms. It does NOT create a new chat/social platform.

Core workflow:
1. Guided consultation
2. Recommendation
3. Blueprint generation
4. Creator review/edit/approval
5. Deterministic execution through platform adapters
6. Ongoing management

Product principle: **AI plans, creator approves, system executes.**

## Current MVP boundaries
- Build the guided discovery and blueprint experience first.
- Discord is the first integration target.
- Do not implement Telegram or WhatsApp until Discord flow and adapter boundaries are stable.
- Do not claim an integration works until tested against the official API.
- Do not build analytics/monetization features before the core setup workflow works.

## Architecture rules
- Use Next.js App Router and TypeScript.
- Keep secrets and all provider API calls server-side.
- Separate AI orchestration from platform execution.
- AI output is untrusted input. Validate it with Zod before use.
- Use a platform-agnostic blueprint schema; provider adapters translate it into platform-specific operations.
- Require explicit user approval before any write action against a connected platform.
- Show a preview/diff of intended changes before approval.
- Execution must be idempotent where possible and produce an audit log.
- Never delete existing channels, roles, messages, or data as part of automatic setup unless a future feature explicitly requests it and the user separately confirms it.
- Request least-privilege OAuth/bot permissions.
- Do not store bot tokens in client-side state, local storage, logs, or source control.

## Engineering rules
- Prefer small, reviewable changes.
- Add or update tests for schema validation and execution logic.
- Use strict TypeScript; avoid `any`.
- Handle loading, empty, error, and success states.
- Keep components accessible and responsive.
- Do not invent environment variables or provider capabilities. Document assumptions.
- Before finishing a task, run lint, typecheck, and tests when available; report any command that could not be run.

## Working agreement
Before implementing a substantial feature:
1. Inspect the existing code.
2. State a short implementation plan.
3. Identify security/data implications.
4. Implement the smallest complete vertical slice.
5. Summarize changed files and verification results.

## Do not
- Do not make direct provider API calls from React client components.
- Do not let the LLM generate executable code, SQL, shell commands, or arbitrary API URLs.
- Do not silently apply blueprint changes to a live community.
- Do not add dependencies without explaining why.
