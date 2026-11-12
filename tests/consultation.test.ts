import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  validateStep,
  validateConsultation,
  generateConsultationSummary,
  prepareRecommendationPayload,
} from "../lib/discovery/consultation";
import { ConsultationAnswers } from "../lib/discovery/types";

const validSampleAnswers: ConsultationAnswers = {
  communityName: "Indie Hacker Guild",
  niche: {
    category: "tech_dev",
    customDescription: "Solo software developers launching micro-SaaS businesses",
  },
  audienceSize: {
    tier: "small",
    primaryPlatform: "Twitter / X",
  },
  communityGoal: {
    primaryGoal: "peer_learning",
    notes: "Weekly demo nights and feedback sessions",
  },
  accessModel: {
    model: "application_invite",
    requiresApproval: true,
    notes: "Members must show a working prototype",
  },
  interactionStyle: {
    pace: "deep_async_threads",
    notes: "Members work across global timezones; keep discussions threaded.",
  },
  moderationCapacity: {
    tier: "minimal_solo",
    hasCommunityGuidelines: true,
    notes: "Solo creator with under an hour a week.",
  },
  budget: {
    tier: "free_only",
    monetizationPlan: "free_community",
  },
  additionalContext: "Keep channel structure minimal so it doesn't feel empty.",
};

describe("Phase 1: Discovery & Consultation Validation", () => {
  test("Step 1 validation requires valid communityName and niche", () => {
    const invalidResult = validateStep(1, {
      communityName: "",
      niche: { category: "tech_dev", customDescription: "" },
    });
    assert.strictEqual(invalidResult.success, false);
    assert.ok(invalidResult.errors.communityName);
    assert.ok(invalidResult.errors.niche);

    const validResult = validateStep(1, {
      communityName: "Valid Name",
      niche: { category: "tech_dev", customDescription: "Tech community" },
    });
    assert.strictEqual(validResult.success, true);
    assert.strictEqual(Object.keys(validResult.errors).length, 0);
  });

  test("Step 2 validation requires audience tier and primary platform", () => {
    const invalidResult = validateStep(2, {
      audienceSize: { tier: "small", primaryPlatform: "" },
    });
    assert.strictEqual(invalidResult.success, false);
    assert.ok(invalidResult.errors.audienceSize);

    const validResult = validateStep(2, {
      audienceSize: { tier: "growing", primaryPlatform: "YouTube" },
    });
    assert.strictEqual(validResult.success, true);
  });

  test("Step 3 validation requires valid primary community goal", () => {
    const validResult = validateStep(3, {
      communityGoal: {
        primaryGoal: "peer_learning",
        notes: "Learning circles",
      },
    });
    assert.strictEqual(validResult.success, true);
  });

  test("Step 4 validation requires valid access model", () => {
    const validResult = validateStep(4, {
      accessModel: {
        model: "application_invite",
        requiresApproval: true,
      },
    });
    assert.strictEqual(validResult.success, true);
  });

  test("Step 5 validation requires interaction style", () => {
    const validResult = validateStep(5, {
      interactionStyle: {
        pace: "realtime_chat",
      },
    });
    assert.strictEqual(validResult.success, true);
  });

  test("Step 6 validation enforces moderation tiers", () => {
    const validResult = validateStep(6, {
      moderationCapacity: {
        tier: "minimal_solo",
        hasCommunityGuidelines: false,
      },
    });
    assert.strictEqual(validResult.success, true);
  });

  test("Step 7 validation enforces budget tier and monetization plan", () => {
    const validResult = validateStep(7, {
      budget: {
        tier: "free_only",
        monetizationPlan: "freemium_tiers",
      },
    });
    assert.strictEqual(validResult.success, true);
  });

  test("validateConsultation succeeds on full valid payload", () => {
    const result = validateConsultation(validSampleAnswers);
    assert.strictEqual(result.success, true);
    assert.ok(result.data);
    assert.strictEqual(result.data.communityName, "Indie Hacker Guild");
    assert.strictEqual(result.data.accessModel.model, "application_invite");
  });

  test("validateConsultation rejects corrupted or incomplete data", () => {
    const result = validateConsultation({
      communityName: "Missing fields",
    });
    assert.strictEqual(result.success, false);
    assert.ok(result.error);
  });
});

describe("Phase 1: Summary Generation", () => {
  test("generateConsultationSummary produces human-readable labels and suggested spaces", () => {
    const summary = generateConsultationSummary(validSampleAnswers);

    assert.strictEqual(summary.communityName, "Indie Hacker Guild");
    assert.strictEqual(summary.recommendedComplexity, "minimal");
    assert.strictEqual(summary.accessLabel, "Application or Invite-Only");
    assert.ok(summary.recommendedInitialSpaces.includes("landing-gate"));
    assert.ok(summary.recommendedInitialSpaces.includes("welcome-and-rules"));
    assert.ok(summary.recommendedInitialSpaces.includes("learning-resources"));
    assert.ok(summary.moderationDetail.includes("already has drafted rules"));
  });
});

describe("Phase 1: AI Recommendation Payload Preparation", () => {
  test("prepareRecommendationPayload includes constraints and candidate platforms", () => {
    const payload = prepareRecommendationPayload(validSampleAnswers);

    assert.strictEqual(payload.version, 1);
    assert.strictEqual(payload.creatorProfile.communityName, "Indie Hacker Guild");
    assert.strictEqual(payload.creatorProfile.niche.category, "tech_dev");
    assert.strictEqual(payload.creatorProfile.access.model, "application_invite");
    assert.ok(payload.promptContext.keyConstraints.some((c) => c.includes("less than 1 hour/week")));
    assert.ok(payload.promptContext.keyConstraints.some((c) => c.includes("free tiers")));
    assert.ok(payload.promptContext.keyConstraints.some((c) => c.includes("gated role assignment")));
    assert.ok(payload.promptContext.suggestedPlatformCandidates.includes("discord"));
  });
});
