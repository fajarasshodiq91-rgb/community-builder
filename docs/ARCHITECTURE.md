# Architecture

## High-level flow
Creator UI → Application API → Consultation/AI service → Blueprint validation → Approval service → Execution queue → Platform adapter → Provider API → Audit log.

## Main modules
- `discovery`: guided questions and creator context
- `recommendations`: platform selection and rationale
- `blueprints`: canonical platform-neutral community model
- `approvals`: immutable approval snapshot and change preview
- `integrations`: provider connection and OAuth/token handling
- `execution`: deterministic, idempotent operations
- `audit`: append-only record of requested and completed actions

## Blueprint design
The canonical blueprint describes desired community structure, not provider API calls. It must not contain arbitrary executable instructions. Provider adapters translate validated blueprint objects into an allowlisted set of provider operations.

Initial conceptual entities:
- User
- CreatorProfile
- Consultation
- Recommendation
- Blueprint
- PlatformConnection
- Approval
- ExecutionJob
- ExecutionOperation
- AuditEvent

## AI boundary
The LLM may:
- Ask follow-up questions
- Summarize creator needs
- Recommend platforms with reasons and caveats
- Propose a blueprint in the defined schema

The LLM may not:
- Hold provider credentials
- Call Discord/Telegram/WhatsApp write APIs directly
- Invent permissions or provider capabilities
- Execute destructive operations
- Bypass creator approval

All model output must be parsed and validated. Invalid output should be rejected and retried safely or shown as an error.

## Approval and execution
- Approval applies to a specific blueprint version/hash.
- Any edit after approval invalidates the approval.
- Before execution, re-check connected account/server and permissions.
- Operations should be idempotent or detect existing resources.
- Never delete or overwrite existing resources by default.
- Record per-operation outcome, provider identifiers, timestamps, and errors without logging secrets.

## Initial stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase Auth + Postgres (when persistence is added)
- Claude API, server-side
- Discord bot/API adapter
- Vercel

## Security baseline
- Secrets only in server environment or managed secret storage.
- Least-privilege scopes and bot permissions.
- Validate all external input.
- Rate-limit AI and provider endpoints.
- Verify OAuth state and callback origin.
- Redact credentials and sensitive tokens from logs.
