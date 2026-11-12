# Architecture decision log

## 001 — Do not build a new community platform
Decision: integrate with existing community platforms.
Reason: the problem is setup and operations complexity, not lack of another place to chat.

## 002 — Guided consultation first
Decision: the first experience is a guided AI consultation for solo creators.
Reason: users often do not know which tools or community structure they need.

## 003 — AI proposes; user approves; deterministic engine executes
Decision: model output never directly executes provider API calls.
Reason: safety, predictability, auditability, and provider-specific constraints.

## 004 — Discord first
Decision: validate the blueprint and execution model with Discord before adding more platforms.
Reason: constrain MVP scope and learn from one integration.
