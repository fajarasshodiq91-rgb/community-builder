# Product Requirements — Community Builder MVP

## 1. Product statement
Community Builder is an AI-guided infrastructure builder for solo creators who want to launch an organized online community but do not know which platforms, spaces, roles, permissions, and onboarding flows they need.

It works with existing platforms instead of replacing them.

## 2. Initial user
A solo creator with an existing audience and a clear reason to bring followers together, but limited technical knowledge or no dedicated community manager.

## 3. Primary job to be done
"When I want to build a community, help me decide what infrastructure I need and set it up safely without making me learn every platform's administration tools."

## 4. MVP user journey
1. Creator starts a guided consultation.
2. Assistant asks about creator niche, audience size, community purpose, interaction style, moderation capacity, budget, and access needs.
3. System summarizes the answers and asks the creator to confirm/correct them.
4. AI recommends a platform (Discord first in MVP) and explains trade-offs.
5. AI generates a structured blueprint: categories, channels, roles, permissions intent, onboarding, and moderation guidance.
6. Creator reviews and edits the blueprint.
7. Creator connects an eligible Discord server/bot.
8. System shows the exact proposed changes.
9. Creator explicitly approves.
10. Execution adapter applies supported changes and reports successes/failures.
11. Creator can inspect an execution log.

## 5. MVP features
### Must have
- Guided consultation UI
- Persisted consultation answers (when database is added)
- Recommendation rationale
- Validated, editable blueprint
- Preview before execution
- Explicit approval
- Discord integration foundation
- Execution status and audit log foundation
- Clear error handling and reconnect flow

### Not in MVP
- New chat/community platform
- Telegram and WhatsApp integrations
- Paid memberships and payment processing
- Full CRM/member database
- Cross-platform unified inbox
- Advanced analytics
- Autonomous moderation
- AI-triggered live changes without approval

## 6. Success measures
- Consultation completion rate
- Percentage of generated blueprints accepted with minor edits
- Time from starting consultation to approved blueprint
- Successful Discord setup rate
- Setup failure rate and recovery rate
- 30-day creator return rate

## 7. Product risks
- Creators may not know what they need; guided questions must be concrete and jargon-free.
- AI can recommend unnecessary complexity; optimize for the simplest viable community.
- Provider APIs and permissions vary; never promise unsupported automation.
- One-time setup can create weak subscription retention; ongoing value must be validated before expanding into operations features.
