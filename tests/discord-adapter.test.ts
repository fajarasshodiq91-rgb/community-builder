import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { CommunityBlueprint } from "../lib/blueprint/types";
import { createApprovalSnapshot } from "../lib/approvals/snapshot";
import { discordAdapter } from "../lib/integrations/discord/adapter";

const sampleBlueprint: CommunityBlueprint = {
  version: 1,
  communityName: "Indie Hub",
  recommendedPlatform: "discord",
  recommendationRationale: "Optimized for indie developers.",
  categories: [
    {
      name: "INFO",
      channels: [
        {
          name: "rules",
          kind: "announcement",
          purpose: "Server rules",
        },
      ],
    },
    {
      name: "COMMUNITY",
      channels: [
        {
          name: "general", // Matches existing mock channel
          kind: "text",
          purpose: "General chat",
        },
        {
          name: "voice-room",
          kind: "voice",
          purpose: "Live voice chat",
        },
      ],
    },
  ],
  roles: [
    {
      name: "Founder",
      purpose: "Owner",
      permissionPreset: "owner",
    },
    {
      name: "Admin", // Matches existing mock role
      purpose: "Administrator",
      permissionPreset: "moderator",
    },
  ],
  onboarding: ["Join server", "Read rules"],
  moderationGuidelines: ["No harassment", "No spam"],
  assumptions: ["Clean setup"],
};

describe("Phase 5: Discord Execution Adapter Contract", () => {
  test("validateConnection returns connection status and required permissions", async () => {
    const status = await discordAdapter.validateConnection({
      guildId: "guild-123",
      guildName: "Test Server",
    });

    assert.strictEqual(status.connected, true);
    assert.ok(status.grantedPermissions.includes("MANAGE_CHANNELS"));
    assert.ok(status.grantedPermissions.includes("MANAGE_ROLES"));
    assert.strictEqual(status.missingPermissions.length, 0);
  });

  test("inspectCurrentState returns existing channels and roles", async () => {
    const currentState = await discordAdapter.inspectCurrentState("guild-123");
    assert.ok(currentState.existingChannels.includes("general"));
    assert.ok(currentState.existingRoles.includes("Admin"));
  });

  test("executeApprovedPlan executes idempotently without deleting resources", async () => {
    const snapshot = createApprovalSnapshot(sampleBlueprint);
    const result = await discordAdapter.executeApprovedPlan(snapshot, {
      guildId: "guild-123",
      guildName: "Indie Hub Server",
    });

    assert.strictEqual(result.status, "completed");
    assert.strictEqual(result.summary.deletionsAttempted, 0);

    // Assert that 'general' was skipped and 'rules', 'voice-room' were created
    assert.ok(result.skippedChannels.includes("general"));
    assert.ok(result.createdChannels.includes("rules"));
    assert.ok(result.createdChannels.includes("voice-room"));

    // Assert that 'Admin' role was skipped and 'Founder' was created
    assert.ok(result.skippedRoles.includes("Admin"));
    assert.ok(result.createdRoles.includes("Founder"));

    // Assert audit log was recorded
    assert.ok(result.auditLog.length >= 4);
    assert.ok(result.auditLog.some((e) => e.action === "approval_granted"));
    assert.ok(result.auditLog.some((e) => e.action === "channel_created"));
    assert.ok(result.auditLog.some((e) => e.action === "channel_skipped"));
  });

  test("rejects execution if blueprint is tampered after approval", async () => {
    const snapshot = createApprovalSnapshot(sampleBlueprint);

    // Corrupt snapshot blueprint
    const tamperedSnapshot = {
      ...snapshot,
      blueprint: {
        ...snapshot.blueprint,
        communityName: "Tampered Name",
      },
    };

    await assert.rejects(
      async () => {
        await discordAdapter.executeApprovedPlan(tamperedSnapshot);
      },
      /Security verification failed/
    );
  });

  test("getOperationStatus retrieves recorded execution by jobId", async () => {
    const snapshot = createApprovalSnapshot(sampleBlueprint);
    const execution = await discordAdapter.executeApprovedPlan(snapshot);

    const retrieved = discordAdapter.getOperationStatus(execution.jobId);
    assert.ok(retrieved);
    assert.strictEqual(retrieved.jobId, execution.jobId);
  });
});
