import { z } from "zod";

/**
 * Step 1: Niche & Topic
 */
export const NicheCategoryEnum = z.enum([
  "tech_dev",
  "gaming",
  "education",
  "creator_art",
  "business_career",
  "fitness_wellness",
  "hobby_lifestyle",
  "other",
]);
export type NicheCategory = z.infer<typeof NicheCategoryEnum>;

export const NicheSchema = z.object({
  category: NicheCategoryEnum,
  customDescription: z
    .string()
    .min(2, "Please describe your niche in at least 2 characters")
    .max(200, "Description must be under 200 characters"),
});
export type Niche = z.infer<typeof NicheSchema>;

/**
 * Step 2: Audience Size & Primary Channel
 */
export const AudienceTierEnum = z.enum([
  "just_starting", // < 500
  "small", // 500 - 5k
  "growing", // 5k - 25k
  "established", // 25k - 100k
  "large", // 100k+
]);
export type AudienceTier = z.infer<typeof AudienceTierEnum>;

export const AudienceSizeSchema = z.object({
  tier: AudienceTierEnum,
  primaryPlatform: z
    .string()
    .min(1, "Please specify where your audience currently follows you")
    .max(50),
});
export type AudienceSize = z.infer<typeof AudienceSizeSchema>;

/**
 * Step 3: Primary Community Goal
 */
export const CommunityGoalEnum = z.enum([
  "peer_learning", // Knowledge sharing, study groups, courses
  "member_support", // Q&A, troubleshooting, product assistance
  "exclusive_inner_circle", // VIP fans, paid patrons, mastermind
  "casual_hangout", // Socializing, banter, shared interest
  "co_creation_feedback", // Beta testing, feedback loops, building together
  "events_cohorts", // Live events, weekly calls, challenges
]);
export type CommunityGoal = z.infer<typeof CommunityGoalEnum>;

export const CommunityGoalSchema = z.object({
  primaryGoal: CommunityGoalEnum,
  notes: z.string().max(300).optional(),
});
export type CommunityGoalData = z.infer<typeof CommunityGoalSchema>;

/**
 * Step 4: Access Model & Entry Boundaries
 */
export const AccessModelEnum = z.enum([
  "open_public", // Anyone with the link can join
  "application_invite", // Curated, invite-only, or application form
  "gated_membership", // Restricted to customers, course students, or paid patrons
]);
export type AccessModel = z.infer<typeof AccessModelEnum>;

export const AccessModelSchema = z.object({
  model: AccessModelEnum,
  requiresApproval: z.boolean().default(false),
  notes: z.string().max(300).optional(),
});
export type AccessModelData = z.infer<typeof AccessModelSchema>;

/**
 * Step 5: Interaction Style & Pace
 */
export const InteractionPaceEnum = z.enum([
  "realtime_chat", // Fast-moving live chat
  "deep_async_threads", // Organized forum-like topics
  "broadcast_announcements", // Creator broadcasts with curated discussion
  "live_voice_video", // Voice stages, regular syncs
  "hybrid_balanced", // Mixed text chat + weekly events
]);
export type InteractionPace = z.infer<typeof InteractionPaceEnum>;

export const InteractionStyleSchema = z.object({
  pace: InteractionPaceEnum,
  notes: z.string().max(300).optional(),
});
export type InteractionStyle = z.infer<typeof InteractionStyleSchema>;

/**
 * Step 6: Moderation Capacity & Time Commitment
 */
export const ModerationTierEnum = z.enum([
  "minimal_solo", // < 1 hr/week, needs strict automation & low maintenance
  "moderate_solo", // 1 - 3 hrs/week solo
  "active_solo", // 4 - 8 hrs/week dedicated
  "team_moderated", // Has trusted mods or co-creators
]);
export type ModerationTier = z.infer<typeof ModerationTierEnum>;

export const ModerationCapacitySchema = z.object({
  tier: ModerationTierEnum,
  hasCommunityGuidelines: z.boolean().default(false),
  notes: z.string().max(300).optional(),
});
export type ModerationCapacity = z.infer<typeof ModerationCapacitySchema>;

/**
 * Step 7: Budget & Tooling Willingness
 */
export const BudgetTierEnum = z.enum([
  "free_only", // $0/mo - purely free platforms and tools
  "lean", // $1 - $30/mo - simple bots or inexpensive add-ons
  "standard", // $30 - $100/mo - paid community platform or server boosts
  "premium", // $100+/mo - dedicated white-label, paid plugins, custom setup
]);
export type BudgetTier = z.infer<typeof BudgetTierEnum>;

export const BudgetSchema = z.object({
  tier: BudgetTierEnum,
  monetizationPlan: z.enum([
    "free_community",
    "freemium_tiers",
    "paid_membership",
    "not_sure_yet",
  ]),
});
export type Budget = z.infer<typeof BudgetSchema>;

/**
 * Full Consultation Answers Schema
 */
export const ConsultationAnswersSchema = z.object({
  communityName: z
    .string()
    .min(2, "Community name must be at least 2 characters")
    .max(100, "Community name must be 100 characters or less"),
  niche: NicheSchema,
  audienceSize: AudienceSizeSchema,
  communityGoal: CommunityGoalSchema,
  accessModel: AccessModelSchema,
  interactionStyle: InteractionStyleSchema,
  moderationCapacity: ModerationCapacitySchema,
  budget: BudgetSchema,
  additionalContext: z.string().max(500).optional(),
});
export type ConsultationAnswers = z.infer<typeof ConsultationAnswersSchema>;

/**
 * Formatted Summary for Creator Review
 */
export interface CreatorProfileSummary {
  communityName: string;
  nicheLabel: string;
  nicheDetail: string;
  audienceLabel: string;
  audienceDetail: string;
  goalLabel: string;
  goalDetail: string;
  accessLabel: string;
  accessDetail: string;
  interactionLabel: string;
  interactionDetail: string;
  moderationLabel: string;
  moderationDetail: string;
  budgetLabel: string;
  budgetDetail: string;
  recommendedComplexity: "minimal" | "moderate" | "comprehensive";
  recommendedInitialSpaces: string[];
}

/**
 * AI Recommendation Payload (Phase 2 input contract)
 * Prepared deterministically from consultation answers
 */
export interface AIRecommendationPayload {
  version: 1;
  creatorProfile: {
    communityName: string;
    niche: {
      category: NicheCategory;
      customDescription: string;
    };
    audience: {
      tier: AudienceTier;
      primaryPlatform: string;
    };
    goals: {
      primary: CommunityGoal;
      notes?: string;
    };
    access: {
      model: AccessModel;
      requiresApproval: boolean;
      notes?: string;
    };
    interaction: {
      pace: InteractionPace;
      notes?: string;
    };
    moderation: {
      tier: ModerationTier;
      hasGuidelines: boolean;
      notes?: string;
    };
    budget: {
      tier: BudgetTier;
      monetizationPlan: string;
    };
    additionalContext?: string;
  };
  promptContext: {
    targetAudienceProfile: string;
    keyConstraints: string[];
    suggestedPlatformCandidates: Array<"discord" | "telegram" | "whatsapp">;
  };
}
