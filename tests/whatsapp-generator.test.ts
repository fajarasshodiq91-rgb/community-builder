import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { CommunityBlueprint } from "../lib/blueprint/types";
import { generateWhatsAppCommunityPackage } from "../lib/integrations/whatsapp/generator";

const sampleBlueprint: CommunityBlueprint = {
  version: 1,
  communityName: "Creator Academy",
  recommendedPlatform: "discord",
  recommendationRationale: "Optimized for cohorts.",
  categories: [
    {
      name: "WELCOME",
      channels: [
        { name: "welcome-and-rules", kind: "announcement", purpose: "Rules" },
        { name: "announcements", kind: "announcement", purpose: "News" },
      ],
    },
    {
      name: "COHORTS",
      channels: [
        { name: "group-discussion", kind: "text", purpose: "Daily chat" },
        { name: "qa-feedback", kind: "text", purpose: "Q&A" },
      ],
    },
  ],
  roles: [
    { name: "Admin", purpose: "Owner", permissionPreset: "owner" },
    { name: "Member", purpose: "Member", permissionPreset: "member" },
  ],
  onboarding: ["Join group"],
  moderationGuidelines: ["Respect each other"],
  assumptions: ["Standard setup"],
};

describe("Multi-Platform: WhatsApp Community Package Generator", () => {
  test("generates announcement group, sub-groups, and copy-ready texts", () => {
    const pkg = generateWhatsAppCommunityPackage(sampleBlueprint);

    assert.strictEqual(pkg.communityName, "Creator Academy");
    assert.strictEqual(pkg.announcementGroup.type, "announcement");
    assert.strictEqual(pkg.announcementGroup.recommendedSettings.onlyAdminsSendMessages, true);

    // Channels other than welcome and announcements become sub-groups
    assert.strictEqual(pkg.subGroups.length, 2);
    assert.ok(pkg.subGroups.some((g) => g.name.includes("group discussion")));
    assert.ok(pkg.subGroups.some((g) => g.name.includes("qa feedback")));

    // Check pre-formatted broadcast texts
    assert.ok(pkg.welcomeBroadcastText.includes("Creator Academy"));
    assert.ok(pkg.rulesBroadcastText.includes("TATA TERTIB"));
    assert.ok(pkg.setupChecklist.length >= 4);
  });
});
