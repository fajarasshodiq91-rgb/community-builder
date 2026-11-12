# Blueprint module

The blueprint is a provider-neutral description of the intended community structure.

Important:
- Validate all AI output with `CommunityBlueprintSchema`.
- Treat permission presets as intent labels, not raw Discord permission bitfields.
- Keep provider-specific IDs and API payloads out of the canonical blueprint.
- A blueprint edit must create a new version and invalidate prior approval.
