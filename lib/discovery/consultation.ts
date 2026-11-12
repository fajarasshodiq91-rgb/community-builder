import {
  AccessModelSchema,
  AudienceSizeSchema,
  BudgetSchema,
  CommunityGoalSchema,
  ConsultationAnswers,
  ConsultationAnswersSchema,
  CreatorProfileSummary,
  InteractionStyleSchema,
  ModerationCapacitySchema,
  NicheSchema,
  AIRecommendationPayload,
} from "./types";

export interface QuestionOption<T extends string = string> {
  value: T;
  label: string;
  description: string;
  icon?: string;
  tag?: string;
}

export interface ConsultationStepConfig {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  question: string;
  explanation: string;
}

export const NICHE_OPTIONS: QuestionOption[] = [
  {
    value: "tech_dev",
    label: "Tech & Software Development",
    description: "Coders, open source maintainers, indie hackers, and tech enthusiasts.",
    icon: "💻",
  },
  {
    value: "creator_art",
    label: "Creative Arts & Design",
    description: "Designers, illustrators, video editors, 3D artists, and writers.",
    icon: "🎨",
  },
  {
    value: "gaming",
    label: "Gaming & Streaming",
    description: "Game developers, esports players, streamers, and gaming clans.",
    icon: "🎮",
  },
  {
    value: "education",
    label: "Education & Mentorship",
    description: "Course creators, teachers, students, book clubs, and peer cohorts.",
    icon: "📚",
  },
  {
    value: "business_career",
    label: "Business & Career Growth",
    description: "Freelancers, agency owners, entrepreneurs, and professional networks.",
    icon: "💼",
  },
  {
    value: "fitness_wellness",
    label: "Fitness, Health & Mindset",
    description: "Personal trainers, wellness coaches, accountability circles.",
    icon: "🏃",
  },
  {
    value: "hobby_lifestyle",
    label: "Hobbies & Lifestyle",
    description: "Makers, music producers, photographers, cooking, collectors.",
    icon: "✨",
  },
  {
    value: "other",
    label: "Other Special Interest",
    description: "Any unique community niche with a dedicated focus.",
    icon: "🌐",
  },
];

export const AUDIENCE_TIER_OPTIONS: QuestionOption[] = [
  {
    value: "just_starting",
    label: "Just Getting Started (< 500)",
    description: "Building your initial core follower base or starting fresh.",
    tag: "Incubation",
  },
  {
    value: "small",
    label: "500 – 5,000 Followers",
    description: "A tight-knit, engaged following where you know many names.",
    tag: "Close-knit",
  },
  {
    value: "growing",
    label: "5,000 – 25,000 Followers",
    description: "Consistent content reach with frequent requests for deeper access.",
    tag: "Active growth",
  },
  {
    value: "established",
    label: "25,000 – 100,000 Followers",
    description: "Established creator with multi-channel reach and strong audience trust.",
    tag: "Established",
  },
  {
    value: "large",
    label: "100,000+ Followers",
    description: "High-volume audience needing structured filtering and clear safety boundaries.",
    tag: "Large scale",
  },
];

export const GOAL_OPTIONS: QuestionOption[] = [
  {
    value: "peer_learning",
    label: "Peer Learning & Skill Sharing",
    description: "Members help each other learn, share workflows, and exchange feedback.",
    icon: "🌱",
  },
  {
    value: "member_support",
    label: "Direct Creator Support & Q&A",
    description: "A central hub for answering audience questions and troubleshooting problems.",
    icon: "💡",
  },
  {
    value: "exclusive_inner_circle",
    label: "Exclusive Inner Circle / VIP",
    description: "A premium, focused space for top supporters, patrons, or clients.",
    icon: "⭐",
  },
  {
    value: "casual_hangout",
    label: "Casual Hangout & Social Hub",
    description: "A fun, relaxed gathering space for fans to chat around common interests.",
    icon: "☕",
  },
  {
    value: "co_creation_feedback",
    label: "Co-creation & Product Feedback",
    description: "Beta testers, early adopters, and collaborators testing what you build.",
    icon: "🛠️",
  },
  {
    value: "events_cohorts",
    label: "Live Events & Challenges",
    description: "Structured live workshops, weekly community calls, or time-boxed challenges.",
    icon: "🎯",
  },
];

export const ACCESS_MODEL_OPTIONS: QuestionOption[] = [
  {
    value: "open_public",
    label: "Open Public Community",
    description: "Anyone with the link can join instantly. Maximizes discovery and organic growth.",
    icon: "🚪",
    tag: "Zero barrier",
  },
  {
    value: "application_invite",
    label: "Application or Invite-Only",
    description: "Prospective members apply or require an invite code. Keeps culture curated and high trust.",
    icon: "🛡️",
    tag: "Curated circle",
  },
  {
    value: "gated_membership",
    label: "Gated Access (Course / Sub / VIP)",
    description: "Access is tied to course students, newsletter subscribers, or verified customers.",
    icon: "🔐",
    tag: "Verified only",
  },
];

export const INTERACTION_PACE_OPTIONS: QuestionOption[] = [
  {
    value: "realtime_chat",
    label: "Active Real-Time Chat",
    description: "Fast-moving channels where people drop in, chat live, and build camaraderie.",
    icon: "💬",
  },
  {
    value: "deep_async_threads",
    label: "Focused Asynchronous Topics",
    description: "Thoughtful posts and threaded discussions that don't get buried overnight.",
    icon: "🧵",
  },
  {
    value: "broadcast_announcements",
    label: "Announcements First",
    description: "Creator broadcasts news, drops, and lessons with lightweight reactions/comments.",
    icon: "📣",
  },
  {
    value: "live_voice_video",
    label: "Voice & Video Focused",
    description: "Regular live voice rooms, screen shares, co-working hours, and stage sessions.",
    icon: "🎙️",
  },
  {
    value: "hybrid_balanced",
    label: "Balanced Hybrid",
    description: "A tidy lounge for daily chat plus structured spaces for key topics and events.",
    icon: "⚖️",
  },
];

export const MODERATION_OPTIONS: QuestionOption[] = [
  {
    value: "minimal_solo",
    label: "Solo with Very Limited Time (< 1 hr/wk)",
    description: "Needs maximum simplicity, automated safety rules, and minimal noisy channels.",
    tag: "High automation",
  },
  {
    value: "moderate_solo",
    label: "Solo with Regular Check-ins (1–3 hrs/wk)",
    description: "You check in once or twice daily to answer questions and keep energy positive.",
    tag: "Balanced",
  },
  {
    value: "active_solo",
    label: "Dedicated Solo Presence (4–8 hrs/wk)",
    description: "You are actively present, hosting sessions, and directly steering conversations.",
    tag: "High touch",
  },
  {
    value: "team_moderated",
    label: "Creator + Volunteer Moderators / Team",
    description: "You have trusted community members or team assistants ready to help moderate.",
    tag: "Delegated",
  },
];

export const BUDGET_OPTIONS: QuestionOption[] = [
  {
    value: "free_only",
    label: "$0 / Completely Free Tools",
    description: "Zero tool cost. Stick to free platform tiers without recurring software bills.",
    tag: "$0 / month",
  },
  {
    value: "lean",
    label: "Lean ($10 – $30 / month)",
    description: "Open to small investments for essential bots, server boosts, or clean onboarding.",
    tag: "<$30 / month",
  },
  {
    value: "standard",
    label: "Standard ($30 – $100 / month)",
    description: "Willing to invest in paid platforms, automated integrations, or premium bots.",
    tag: "$30-$100 / month",
  },
  {
    value: "premium",
    label: "Premium / Growth ($100+ / month)",
    description: "Ready for advanced software, custom branding, or white-label community suites.",
    tag: "$100+ / month",
  },
];

export const STEPS_CONFIG: ConsultationStepConfig[] = [
  {
    id: "identity",
    stepNumber: 1,
    title: "Community Name & Niche",
    subtitle: "Define what your community is called and who it gathers.",
    question: "What is your community called, and what space are you in?",
    explanation: "This helps tailor channel suggestions and tone of voice to your audience's language.",
  },
  {
    id: "audience",
    stepNumber: 2,
    title: "Audience & Reach",
    subtitle: "Gauge your current audience size and primary channel.",
    question: "How large is your current following, and where do they know you from?",
    explanation: "Audience size determines whether you need simple open rooms or multi-stage moderation filters.",
  },
  {
    id: "goal",
    stepNumber: 3,
    title: "Primary Goal",
    subtitle: "Identify the number one reason members should join.",
    question: "What is the single most valuable outcome members get from being here?",
    explanation: "Communities with one clear core purpose stay active; vague communities turn into ghost towns.",
  },
  {
    id: "access",
    stepNumber: 4,
    title: "Access & Entry Boundaries",
    subtitle: "Determine who is allowed in and how they enter.",
    question: "How should new members gain entry to your community?",
    explanation: "Setting clear entry boundaries prevents spam raids and establishes member commitment early.",
  },
  {
    id: "interaction",
    stepNumber: 5,
    title: "Interaction Style",
    subtitle: "Set the rhythm and pace for conversations.",
    question: "How should members interact with you and each other on a daily basis?",
    explanation: "Different platforms suit fast real-time chat versus quiet, long-form discussion threads.",
  },
  {
    id: "moderation",
    stepNumber: 6,
    title: "Moderation Capacity",
    subtitle: "Plan around your actual available time.",
    question: "How much time can you realistically invest in moderating each week?",
    explanation: "Over-designed channel structures fail when a solo creator burns out. We keep it realistic.",
  },
  {
    id: "budget",
    stepNumber: 7,
    title: "Budget & Monetization",
    subtitle: "Align infrastructure with your financial plan.",
    question: "What is your budget for community tooling, and what is your monetization approach?",
    explanation: "Prevents recommending expensive software when great free or low-cost options exist.",
  },
];

/**
 * Validate answers for a specific step
 */
export function validateStep(
  stepNumber: number,
  data: Partial<ConsultationAnswers>
): { success: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  try {
    switch (stepNumber) {
      case 1: {
        if (!data.communityName || data.communityName.trim().length < 2) {
          errors.communityName = "Please enter a community name (at least 2 characters)";
        } else if (data.communityName.length > 100) {
          errors.communityName = "Community name cannot exceed 100 characters";
        }

        const nicheResult = NicheSchema.safeParse(data.niche);
        if (!nicheResult.success) {
          errors.niche = nicheResult.error.issues[0]?.message || "Please select a valid niche";
        }
        break;
      }
      case 2: {
        const audienceResult = AudienceSizeSchema.safeParse(data.audienceSize);
        if (!audienceResult.success) {
          errors.audienceSize = audienceResult.error.issues[0]?.message || "Please complete audience information";
        }
        break;
      }
      case 3: {
        const goalResult = CommunityGoalSchema.safeParse(data.communityGoal);
        if (!goalResult.success) {
          errors.communityGoal = goalResult.error.issues[0]?.message || "Please choose a primary community goal";
        }
        break;
      }
      case 4: {
        const accessResult = AccessModelSchema.safeParse(data.accessModel);
        if (!accessResult.success) {
          errors.accessModel = accessResult.error.issues[0]?.message || "Please choose an access model";
        }
        break;
      }
      case 5: {
        const interactionResult = InteractionStyleSchema.safeParse(data.interactionStyle);
        if (!interactionResult.success) {
          errors.interactionStyle = interactionResult.error.issues[0]?.message || "Please choose an interaction style";
        }
        break;
      }
      case 6: {
        const modResult = ModerationCapacitySchema.safeParse(data.moderationCapacity);
        if (!modResult.success) {
          errors.moderationCapacity = modResult.error.issues[0]?.message || "Please select your moderation capacity";
        }
        break;
      }
      case 7: {
        const budgetResult = BudgetSchema.safeParse(data.budget);
        if (!budgetResult.success) {
          errors.budget = budgetResult.error.issues[0]?.message || "Please specify your budget and monetization plan";
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    errors.general = err instanceof Error ? err.message : "Validation error occurred";
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates the entire consultation answers payload
 */
export function validateConsultation(answers: unknown): {
  success: boolean;
  data?: ConsultationAnswers;
  error?: string;
} {
  const result = ConsultationAnswersSchema.safeParse(answers);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map((i) => i.message).join(", "),
    };
  }
  return {
    success: true,
    data: result.data,
  };
}

/**
 * Generates a human-readable structured summary for the creator review step
 */
export function generateConsultationSummary(answers: ConsultationAnswers): CreatorProfileSummary {
  const nicheOpt = NICHE_OPTIONS.find((o) => o.value === answers.niche.category);
  const audienceOpt = AUDIENCE_TIER_OPTIONS.find((o) => o.value === answers.audienceSize.tier);
  const goalOpt = GOAL_OPTIONS.find((o) => o.value === answers.communityGoal.primaryGoal);
  const accessOpt = ACCESS_MODEL_OPTIONS.find((o) => o.value === answers.accessModel.model);
  const paceOpt = INTERACTION_PACE_OPTIONS.find((o) => o.value === answers.interactionStyle.pace);
  const modOpt = MODERATION_OPTIONS.find((o) => o.value === answers.moderationCapacity.tier);
  const budgetOpt = BUDGET_OPTIONS.find((o) => o.value === answers.budget.tier);

  // Derive recommended initial complexity based on moderation and audience tier
  let recommendedComplexity: "minimal" | "moderate" | "comprehensive" = "minimal";
  if (answers.moderationCapacity.tier === "minimal_solo" || answers.audienceSize.tier === "just_starting") {
    recommendedComplexity = "minimal";
  } else if (
    answers.moderationCapacity.tier === "team_moderated" ||
    answers.audienceSize.tier === "established" ||
    answers.audienceSize.tier === "large"
  ) {
    recommendedComplexity = "comprehensive";
  } else {
    recommendedComplexity = "moderate";
  }

  // Recommended baseline spaces
  const spaces: string[] = ["welcome-and-rules", "introductions", "general-discussion"];

  // Gatekeeping spaces if access model is gated or application based
  if (answers.accessModel.model === "application_invite" || answers.accessModel.requiresApproval) {
    spaces.unshift("landing-gate");
  }

  if (answers.communityGoal.primaryGoal === "peer_learning") {
    spaces.push("learning-resources", "showcase-and-critique", "questions-help");
  } else if (answers.communityGoal.primaryGoal === "member_support") {
    spaces.push("help-desk", "frequently-asked-questions", "feedback-suggestions");
  } else if (answers.communityGoal.primaryGoal === "exclusive_inner_circle") {
    spaces.push("vip-lounge", "creator-updates", "private-q-and-a");
  } else if (answers.communityGoal.primaryGoal === "events_cohorts") {
    spaces.push("event-announcements", "stage-chat", "weekly-challenges");
  } else if (answers.communityGoal.primaryGoal === "co_creation_feedback") {
    spaces.push("product-sneak-peeks", "bug-reports", "feature-ideas");
  }

  if (
    answers.interactionStyle.pace === "live_voice_video" ||
    answers.interactionStyle.pace === "hybrid_balanced"
  ) {
    spaces.push("voice-hangout");
  }

  return {
    communityName: answers.communityName,
    nicheLabel: nicheOpt?.label || answers.niche.category,
    nicheDetail: answers.niche.customDescription,
    audienceLabel: audienceOpt?.label || answers.audienceSize.tier,
    audienceDetail: `Primary audience channel: ${answers.audienceSize.primaryPlatform}`,
    goalLabel: goalOpt?.label || answers.communityGoal.primaryGoal,
    goalDetail: answers.communityGoal.notes || goalOpt?.description || "",
    accessLabel: accessOpt?.label || answers.accessModel.model,
    accessDetail: answers.accessModel.requiresApproval
      ? "Manual approval or verification required for new joins."
      : accessOpt?.description || "Open access",
    interactionLabel: paceOpt?.label || answers.interactionStyle.pace,
    interactionDetail: answers.interactionStyle.notes || paceOpt?.description || "",
    moderationLabel: modOpt?.label || answers.moderationCapacity.tier,
    moderationDetail: answers.moderationCapacity.hasCommunityGuidelines
      ? "Creator already has drafted rules/guidelines."
      : "Will need AI-generated starter community guidelines.",
    budgetLabel: budgetOpt?.label || answers.budget.tier,
    budgetDetail: `Monetization model: ${answers.budget.monetizationPlan.replace(/_/g, " ")}`,
    recommendedComplexity,
    recommendedInitialSpaces: spaces,
  };
}

/**
 * Prepares the deterministic payload ready for AI Platform Recommendation (Phase 2)
 */
export function prepareRecommendationPayload(answers: ConsultationAnswers): AIRecommendationPayload {
  const constraints: string[] = [];

  if (answers.moderationCapacity.tier === "minimal_solo") {
    constraints.push("Creator has less than 1 hour/week. Strict minimalist layout required with anti-spam defaults.");
  }
  if (answers.budget.tier === "free_only") {
    constraints.push("No paid bot or platform subscriptions allowed. Must operate 100% on free tiers.");
  }
  if (answers.accessModel.model === "gated_membership" || answers.accessModel.requiresApproval) {
    constraints.push("Requires gated role assignment and verification onboarding flow.");
  }
  if (answers.interactionStyle.pace === "deep_async_threads") {
    constraints.push("Needs strong threading/forum post capabilities so conversations remain organized.");
  }
  if (answers.audienceSize.tier === "large") {
    constraints.push("Large audience scale. Mandatory verification gating and anti-raid permissions required.");
  }

  // Suggest platform candidates based on answers (Discord is primary MVP candidate)
  const candidates: Array<"discord" | "telegram" | "whatsapp"> = ["discord"];
  if (answers.interactionStyle.pace === "broadcast_announcements") {
    candidates.push("telegram");
  }
  if (answers.interactionStyle.pace === "deep_async_threads" || answers.interactionStyle.pace === "realtime_chat") {
    if (!candidates.includes("discord")) candidates.push("discord");
  }

  return {
    version: 1,
    creatorProfile: {
      communityName: answers.communityName,
      niche: {
        category: answers.niche.category,
        customDescription: answers.niche.customDescription,
      },
      audience: {
        tier: answers.audienceSize.tier,
        primaryPlatform: answers.audienceSize.primaryPlatform,
      },
      goals: {
        primary: answers.communityGoal.primaryGoal,
        notes: answers.communityGoal.notes,
      },
      access: {
        model: answers.accessModel.model,
        requiresApproval: answers.accessModel.requiresApproval,
        notes: answers.accessModel.notes,
      },
      interaction: {
        pace: answers.interactionStyle.pace,
        notes: answers.interactionStyle.notes,
      },
      moderation: {
        tier: answers.moderationCapacity.tier,
        hasGuidelines: answers.moderationCapacity.hasCommunityGuidelines,
        notes: answers.moderationCapacity.notes,
      },
      budget: {
        tier: answers.budget.tier,
        monetizationPlan: answers.budget.monetizationPlan,
      },
      additionalContext: answers.additionalContext,
    },
    promptContext: {
      targetAudienceProfile: `${answers.communityName} community in ${answers.niche.customDescription} with ${answers.audienceSize.tier} following on ${answers.audienceSize.primaryPlatform} (${answers.accessModel.model} model)`,
      keyConstraints: constraints,
      suggestedPlatformCandidates: candidates,
    },
  };
}
