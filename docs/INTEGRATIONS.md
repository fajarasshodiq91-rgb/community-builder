# Integration strategy

## Discord — first adapter
Build only after the consultation and blueprint flow is validated.

Potential supported setup operations (subject to current Discord API and permission verification):
- Create channel categories and channels
- Create roles
- Configure supported channel/role permission overwrites
- Apply safe channel metadata

Requirements:
- Dedicated Discord application/bot
- OAuth/install flow with least-privilege permissions
- Server selection and permission check
- Preview of every planned change
- Explicit approval
- Execution log and retry handling

Do not assume a bot can perform every action. Verify API behavior and required permissions against official Discord documentation during implementation.

## Telegram — later
Evaluate Bot API capabilities and group administrator requirements before promising setup automation.

## WhatsApp — later
Evaluate official WhatsApp Business Platform capabilities and restrictions. Do not assume it can create or administer ordinary WhatsApp groups. If official APIs do not support an action, provide a guided/manual setup flow instead of unofficial automation.

## Adapter contract
Each provider adapter should expose:
- `validateConnection`
- `inspectCurrentState`
- `planChanges`
- `executeApprovedPlan`
- `getOperationStatus`

Adapters must accept validated, typed inputs and must not accept arbitrary model-generated API calls.
