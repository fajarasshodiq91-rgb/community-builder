import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { CommunityBlueprint } from "../lib/blueprint/types";
import { createApprovalSnapshot } from "../lib/approvals/snapshot";
import { telegramAdapter } from "../lib/integrations/telegram/adapter";

const sampleBlueprint: CommunityBlueprint = {
  version: 1,
  communityName: "Dev Supergroup",
  recommendedPlatform: "discord",
  recommendationRationale: "Optimized for discussion.",
  categories: [
    {
      name: "MAIN",
      channels: [
        { name: "general", kind: "text", purpose: "General chat" },
        { name: "questions", kind: "forum", purpose: "Ask questions" },
      ],
    },
    {
      name: "ANNOUNCEMENTS",
      channels: [
        { name: "updates", kind: "announcement", purpose: "Official news" },
      ],
    },
  ],
  roles: [
    { name: "Admin", purpose: "Owner", permissionPreset: "owner" },
    { name: "Member", purpose: "User", permissionPreset: "member" },
  ],
  onboarding: ["Join supergroup"],
  moderationGuidelines: ["No spam"],
  assumptions: ["Supergroup forum mode enabled"],
};

describe("Multi-Platform: Telegram Supergroup Adapter", () => {
  test("validateConnection returns forum status and bot details", async () => {
    const status = await telegramAdapter.validateConnection({
      chatId: "-1001234567890",
      chatTitle: "Dev Supergroup",
    });

    assert.strictEqual(status.connected, true);
    assert.strictEqual(status.isForum, true);
    assert.strictEqual(status.canManageTopics, true);
    assert.ok(status.botUsername);
  });

  test("executeApprovedPlan provisions forum topics matching blueprint channels", async () => {
    const snapshot = createApprovalSnapshot(sampleBlueprint);
    const result = await telegramAdapter.executeApprovedPlan(snapshot, {
      chatId: "-1001234567890",
      chatTitle: "Dev Supergroup",
    });

    assert.strictEqual(result.status, "completed");
    assert.strictEqual(result.createdTopics.length, 3); // general, questions, updates
    assert.ok(result.createdTopics.some((t) => t.name === "general"));
    assert.ok(result.createdTopics.some((t) => t.name === "questions"));
    assert.ok(result.createdTopics.some((t) => t.name === "updates"));
    assert.ok(result.auditLog.length >= 4);
  });
});
