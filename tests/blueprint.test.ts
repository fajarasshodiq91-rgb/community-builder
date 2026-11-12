import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ConsultationAnswers } from "../lib/discovery/types";
import { evaluatePlatformRecommendation } from "../lib/recommendations/engine";
import { generateCommunityBlueprint } from "../lib/blueprint/generator";
import { CommunityBlueprintSchema } from "../lib/blueprint/types";

const sampleAnswers: ConsultationAnswers = {
  communityName: "Pixel Artisans",
  niche: {
    category: "creator_art",
    customDescription: "Digital illustrators and pixel artists sharing workflows",
  },
  audienceSize: {
    tier: "small",
    primaryPlatform: "Twitter / X",
  },
  communityGoal: {
    primaryGoal: "peer_learning",
    notes: "Weekly critique circles",
  },
  accessModel: {
    model: "open_public",
    requiresApproval: false,
  },
  interactionStyle: {
    pace: "deep_async_threads",
    notes: "Prefer forum topics so art threads don't get lost",
  },
  moderationCapacity: {
    tier: "minimal_solo",
    hasCommunityGuidelines: false,
  },
  budget: {
    tier: "free_only",
    monetizationPlan: "free_community",
  },
  additionalContext: "Keep channels minimal and focused.",
};

describe("Phase 2: Platform Recommendation Engine", () => {
  test("recommends Discord with high fit score and detailed trade-offs", () => {
    const recommendation = evaluatePlatformRecommendation(sampleAnswers);

    assert.strictEqual(recommendation.primaryPlatform, "discord");
    assert.ok(recommendation.fitScore >= 80);
    assert.ok(recommendation.headline.includes("Pixel Artisans"));
    assert.ok(recommendation.tradeoffs.pros.length > 0);
    assert.ok(recommendation.tradeoffs.cons.length > 0);
    assert.strictEqual(recommendation.alternatives.length, 2);
  });

  test("penalizes unorganized platforms when async threads are preferred", () => {
    const recommendation = evaluatePlatformRecommendation(sampleAnswers);
    const whatsappAlt = recommendation.alternatives.find((a) => a.platform === "whatsapp");
    assert.ok(whatsappAlt);
    assert.ok(whatsappAlt.fitScore < recommendation.fitScore);
  });
});

describe("Phase 3: Blueprint Generation & Schema Validation", () => {
  test("generates a canonical Community Blueprint matching CommunityBlueprintSchema", () => {
    const recommendation = evaluatePlatformRecommendation(sampleAnswers);
    const blueprint = generateCommunityBlueprint(sampleAnswers, recommendation);

    // Validate with Zod schema
    const check = CommunityBlueprintSchema.safeParse(blueprint);
    assert.strictEqual(check.success, true);

    // Assert essential structures
    assert.strictEqual(blueprint.version, 1);
    assert.strictEqual(blueprint.communityName, "Pixel Artisans");
    assert.strictEqual(blueprint.recommendedPlatform, "discord");

    // Check categories and channels
    assert.ok(blueprint.categories.length >= 3);
    const infoCat = blueprint.categories.find((c) => c.name === "START HERE");
    assert.ok(infoCat);
    assert.ok(infoCat.channels.some((ch) => ch.name === "welcome-and-rules"));

    // Check role presets
    assert.ok(blueprint.roles.some((r) => r.permissionPreset === "owner"));
    assert.ok(blueprint.roles.some((r) => r.permissionPreset === "member"));

    // Check onboarding and moderation
    assert.ok(blueprint.onboarding.length >= 2);
    assert.ok(blueprint.moderationGuidelines.length >= 2);
  });

  test("adapts channels based on community goal", () => {
    const supportAnswers: ConsultationAnswers = {
      ...sampleAnswers,
      communityGoal: {
        primaryGoal: "member_support",
      },
    };
    const recommendation = evaluatePlatformRecommendation(supportAnswers);
    const blueprint = generateCommunityBlueprint(supportAnswers, recommendation);

    const allChannels = blueprint.categories.flatMap((c) => c.channels);
    assert.ok(allChannels.some((ch) => ch.name === "help-desk"));
  });

  test("adds landing-gate channel when accessModel requires approval", () => {
    const gatedAnswers: ConsultationAnswers = {
      ...sampleAnswers,
      accessModel: {
        model: "application_invite",
        requiresApproval: true,
      },
    };
    const recommendation = evaluatePlatformRecommendation(gatedAnswers);
    const blueprint = generateCommunityBlueprint(gatedAnswers, recommendation);

    const allChannels = blueprint.categories.flatMap((c) => c.channels);
    assert.ok(allChannels.some((ch) => ch.name === "landing-gate"));
  });
});
