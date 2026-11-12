import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { CommunityBlueprint } from "../lib/blueprint/types";
import {
  createApprovalSnapshot,
  generateChangePreview,
  verifyApprovalIntegrity,
} from "../lib/approvals/snapshot";

const sampleBlueprint: CommunityBlueprint = {
  version: 1,
  communityName: "Dev Studio",
  recommendedPlatform: "discord",
  recommendationRationale: "Tailored for software collaboration.",
  categories: [
    {
      name: "START HERE",
      channels: [
        {
          name: "welcome",
          kind: "announcement",
          purpose: "Welcome channel",
        },
      ],
    },
    {
      name: "GENERAL",
      channels: [
        {
          name: "chat",
          kind: "text",
          purpose: "General talk",
        },
      ],
    },
  ],
  roles: [
    {
      name: "Admin",
      purpose: "Owner",
      permissionPreset: "owner",
    },
    {
      name: "Member",
      purpose: "Regular member",
      permissionPreset: "member",
    },
  ],
  onboarding: ["Step 1: Read welcome"],
  moderationGuidelines: ["Be nice"],
  assumptions: ["Server starts clean"],
};

describe("Phase 4: Approval Snapshot & Tamper Detection", () => {
  test("creates a valid cryptographic approval snapshot", () => {
    const snapshot = createApprovalSnapshot(sampleBlueprint);

    assert.ok(snapshot.id.startsWith("appr_"));
    assert.strictEqual(snapshot.blueprintHash.length, 64); // SHA-256 hex string length
    assert.strictEqual(snapshot.creatorConfirmed, true);
    assert.strictEqual(snapshot.version, 1);
  });

  test("verifies approval integrity on unchanged blueprint", () => {
    const snapshot = createApprovalSnapshot(sampleBlueprint);
    const isValid = verifyApprovalIntegrity(snapshot, sampleBlueprint);
    assert.strictEqual(isValid, true);
  });

  test("tampering with blueprint invalidates prior approval", () => {
    const snapshot = createApprovalSnapshot(sampleBlueprint);

    // Modify a channel name in blueprint
    const tamperedBlueprint: CommunityBlueprint = {
      ...sampleBlueprint,
      categories: [
        {
          ...sampleBlueprint.categories[0],
          channels: [
            {
              name: "tampered-channel",
              kind: "text",
              purpose: "Injected channel",
            },
          ],
        },
      ],
    };

    const isValid = verifyApprovalIntegrity(snapshot, tamperedBlueprint);
    assert.strictEqual(isValid, false);
  });
});

describe("Phase 4: Change Preview & Invariants", () => {
  test("guarantees 0 deletions and accurate planned counts", () => {
    const snapshot = createApprovalSnapshot(sampleBlueprint);
    const preview = generateChangePreview(snapshot);

    assert.strictEqual(preview.summary.deletionsCount, 0);
    assert.strictEqual(preview.summary.categoriesToCreate, 2);
    assert.strictEqual(preview.summary.channelsToCreate, 2);
    assert.strictEqual(preview.summary.rolesToCreate, 2);
    assert.ok(preview.safetyInvariants.some((s) => s.includes("Zero Deletions")));
  });

  test("detects existing channels and marks them as skipped (Idempotency)", () => {
    const snapshot = createApprovalSnapshot(sampleBlueprint);
    const preview = generateChangePreview(snapshot, {
      existingChannels: ["chat"], // 'chat' channel already exists
      existingRoles: ["Member"], // 'Member' role already exists
    });

    assert.strictEqual(preview.summary.channelsToCreate, 1); // Only 'welcome' to create
    assert.strictEqual(preview.summary.rolesToCreate, 1); // Only 'Admin' to create

    const chatOp = preview.plannedChannels.find((c) => c.channelName === "chat");
    assert.ok(chatOp);
    assert.strictEqual(chatOp.action, "skip_existing");

    const memberRoleOp = preview.plannedRoles.find((r) => r.roleName === "Member");
    assert.ok(memberRoleOp);
    assert.strictEqual(memberRoleOp.action, "skip_existing");
  });
});
