import { ConsultationAnswers } from "@/lib/discovery/types";
import { PlatformRecommendation } from "@/lib/recommendations/types";
import {
  CategorySchema,
  CommunityBlueprint,
  CommunityBlueprintSchema,
  RoleSchema,
} from "./types";
import { z } from "zod";

type Category = z.infer<typeof CategorySchema>;
type Role = z.infer<typeof RoleSchema>;

/**
 * Deterministic Blueprint Generator
 * Synthesizes consultation answers into a validated, canonical Community Blueprint.
 */
export function generateCommunityBlueprint(
  answers: ConsultationAnswers,
  recommendation: PlatformRecommendation
): CommunityBlueprint {
  const categories: Category[] = [];
  const roles: Role[] = [];
  const onboarding: string[] = [];
  const moderationGuidelines: string[] = [];
  const assumptions: string[] = [];

  // --- 1. Roles ---
  roles.push({
    name: "Community Lead",
    purpose: "Creator & overall server owner with complete administrative access.",
    permissionPreset: "owner",
  });

  if (answers.moderationCapacity.tier !== "minimal_solo") {
    roles.push({
      name: "Community Moderator",
      purpose: "Trusted moderators who help enforce guidelines, answer questions, and manage member issues.",
      permissionPreset: "moderator",
    });
  }

  if (answers.accessModel.model === "gated_membership" || answers.budget.monetizationPlan === "freemium_tiers") {
    roles.push({
      name: "Inner Circle VIP",
      purpose: "Patrons, course members, or premium subscribers with access to exclusive channels.",
      permissionPreset: "member",
    });
  }

  roles.push({
    name: "Member",
    purpose: "Verified community members with standard posting and voice permissions.",
    permissionPreset: "member",
  });

  roles.push({
    name: "Visitor / Unverified",
    purpose: "New arrivals waiting to complete onboarding or agree to rules.",
    permissionPreset: "read_only",
  });

  // --- 2. Categories & Channels ---

  // Category: INFORMATION / WELCOME
  const infoChannels: Category["channels"] = [
    {
      name: "welcome-and-rules",
      purpose: "Community values, code of conduct, and quick-start guide for all new arrivals.",
      kind: "announcement",
    },
    {
      name: "announcements",
      purpose: "Official updates, drops, schedule changes, and creator broadcasts.",
      kind: "announcement",
    },
  ];

  if (answers.accessModel.requiresApproval || answers.accessModel.model === "application_invite") {
    infoChannels.unshift({
      name: "landing-gate",
      purpose: "Holding area for new members to introduce themselves or verify access before entering main spaces.",
      kind: "text",
    });
  }

  categories.push({
    name: "START HERE",
    channels: infoChannels,
  });

  // Category: MAIN HUB
  const mainChannels: Category["channels"] = [
    {
      name: "introductions",
      purpose: "New members share their background, goals, and social handles.",
      kind: "text",
    },
    {
      name: "general-chat",
      purpose: "Daily casual chatter, watercooler banter, and real-time member check-ins.",
      kind: "text",
    },
  ];

  if (answers.interactionStyle.pace === "deep_async_threads") {
    mainChannels.push({
      name: "discussions",
      purpose: "Organized forum topics for thoughtful, long-form community conversations.",
      kind: "forum",
    });
  }

  categories.push({
    name: "COMMUNITY HUB",
    channels: mainChannels,
  });

  // Category: NICHE & GOAL SPECIFIC
  const nicheChannels: Category["channels"] = [];

  switch (answers.communityGoal.primaryGoal) {
    case "peer_learning":
      nicheChannels.push(
        {
          name: "learning-resources",
          purpose: "Curated guides, useful links, articles, and learning templates.",
          kind: "announcement",
        },
        {
          name: "showcase-and-feedback",
          purpose: "Members post their work in progress to receive peer critique and encouragement.",
          kind: "forum",
        },
        {
          name: "questions-and-help",
          purpose: "Ask for help, troubleshoot issues, and share solutions.",
          kind: "forum",
        }
      );
      break;

    case "member_support":
      nicheChannels.push(
        {
          name: "frequently-asked-questions",
          purpose: "Quick answers to the most common member questions.",
          kind: "announcement",
        },
        {
          name: "help-desk",
          purpose: "Structured threads for reporting issues and getting creator support.",
          kind: "forum",
        },
        {
          name: "feature-requests",
          purpose: "Community suggestions and ideas for improvements.",
          kind: "forum",
        }
      );
      break;

    case "exclusive_inner_circle":
      nicheChannels.push(
        {
          name: "vip-lounge",
          purpose: "Exclusive private discussions for core supporters and patrons.",
          kind: "text",
        },
        {
          name: "creator-behind-the-scenes",
          purpose: "Early sneak-peeks, personal notes, and unreleased content.",
          kind: "announcement",
        },
        {
          name: "monthly-ama",
          purpose: "Ask Me Anything forum threads for direct creator interaction.",
          kind: "forum",
        }
      );
      break;

    case "co_creation_feedback":
      nicheChannels.push(
        {
          name: "beta-feedback",
          purpose: "Early testing feedback on new projects, drafts, or prototypes.",
          kind: "forum",
        },
        {
          name: "roadmap-updates",
          purpose: "Progress updates and milestones on community-built initiatives.",
          kind: "announcement",
        }
      );
      break;

    case "events_cohorts":
      nicheChannels.push(
        {
          name: "event-schedule",
          purpose: "Upcoming workshops, live streams, and community calls calendar.",
          kind: "announcement",
        },
        {
          name: "live-chat-stage",
          purpose: "Real-time companion chat during live sessions and presentations.",
          kind: "text",
        }
      );
      break;

    case "casual_hangout":
    default:
      nicheChannels.push(
        {
          name: "memes-and-fun",
          purpose: "Lighthearted media, jokes, and funny moments.",
          kind: "text",
        },
        {
          name: "wins-and-milestones",
          purpose: "Celebrate member achievements and daily wins.",
          kind: "text",
        }
      );
      break;
  }

  categories.push({
    name: answers.niche.customDescription.toUpperCase().slice(0, 30) || "FOCUS & CRAFT",
    channels: nicheChannels,
  });

  // Category: VOICE & GATHERINGS (if applicable)
  if (
    answers.interactionStyle.pace === "live_voice_video" ||
    answers.interactionStyle.pace === "hybrid_balanced"
  ) {
    categories.push({
      name: "LIVE VOICE",
      channels: [
        {
          name: "community-lounge",
          purpose: "Open voice room for drop-in casual conversations and co-working.",
          kind: "voice",
        },
        {
          name: "stage-events",
          purpose: "Broadcast voice stage for creator Q&A sessions and workshops.",
          kind: "voice",
        },
      ],
    });
  }

  // --- 3. Onboarding Steps ---
  onboarding.push("Step 1: Read #welcome-and-rules and click the verification checkmark.");
  onboarding.push("Step 2: Post a 2-sentence introduction in #introductions to earn the Member role.");
  if (answers.accessModel.model === "gated_membership") {
    onboarding.push("Step 3: Connect your account to claim your VIP role badge.");
  }
  onboarding.push(`Step ${onboarding.length + 1}: Jump into #general-chat and say hi to fellow creators!`);

  // --- 4. Moderation Guidelines ---
  if (answers.moderationCapacity.hasCommunityGuidelines) {
    moderationGuidelines.push("Creator will bring existing guidelines into #welcome-and-rules.");
  } else {
    moderationGuidelines.push("Be constructive and respectful in all exchanges; constructive critique is welcomed, harassment is not.");
    moderationGuidelines.push("No unsolicited commercial direct messages or spamming referral links.");
    moderationGuidelines.push("Keep discussions in their respective dedicated channels to maintain clarity.");
    moderationGuidelines.push("Use message threads when diving deep into specific questions to prevent cluttering the main feed.");
  }

  // --- 5. Assumptions ---
  assumptions.push("Discord server created with default safety level and AutoMod enabled.");
  assumptions.push("New members land in read-only info channels until completing basic onboarding.");
  if (answers.moderationCapacity.tier === "minimal_solo") {
    assumptions.push("Channel count strictly constrained under 10 spaces to ensure <1 hour/week solo maintenance.");
  }
  assumptions.push("No live changes will be written to connected platforms without creator review and explicit approval.");

  const rawBlueprint: CommunityBlueprint = {
    version: 1,
    communityName: answers.communityName,
    recommendedPlatform: "discord",
    recommendationRationale: recommendation.rationale,
    categories,
    roles,
    onboarding,
    moderationGuidelines,
    assumptions,
  };

  // Validate with Zod before returning to ensure architectural integrity
  const parsed = CommunityBlueprintSchema.safeParse(rawBlueprint);
  if (!parsed.success) {
    throw new Error(`Generated blueprint validation failed: ${parsed.error.message}`);
  }

  return parsed.data;
}
