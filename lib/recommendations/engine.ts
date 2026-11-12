import { ConsultationAnswers } from "@/lib/discovery/types";
import { PlatformRecommendation } from "./types";

/**
 * Platform Recommendation Engine
 * Evaluates creator needs and generates a scored platform recommendation with transparent trade-offs.
 */
export function evaluatePlatformRecommendation(
  answers: ConsultationAnswers
): PlatformRecommendation {
  let discordScore = 85;
  let telegramScore = 65;
  let whatsappScore = 45;

  const pros: string[] = [];
  const cons: string[] = [];
  const caveats: string[] = [];

  // 1. Channel Structure & Organization
  if (answers.interactionStyle.pace === "deep_async_threads") {
    discordScore += 10;
    telegramScore -= 10;
    whatsappScore -= 20;
    pros.push("Forum channels and message threading keep long-form topics organized without burying discussions.");
  } else if (answers.interactionStyle.pace === "broadcast_announcements") {
    telegramScore += 15;
    pros.push("Announcement channels allow push updates while keeping comment noise separated.");
  } else {
    pros.push("Structured categories separate chat rooms, learning materials, and creator announcements cleanly.");
  }

  // 2. Access Control & Gating
  if (answers.accessModel.model === "gated_membership" || answers.accessModel.requiresApproval) {
    discordScore += 10;
    whatsappScore -= 15;
    pros.push("Granular role-based permissions allow automatic gating for VIPs, course students, or approved members.");
  } else {
    pros.push("Instant link invites with configurable onboarding verification rules.");
  }

  // 3. Moderation & Safety
  if (answers.moderationCapacity.tier === "minimal_solo") {
    pros.push("Built-in AutoMod and permission presets block spam raids even when you are offline.");
    caveats.push("Limit channel count to 5–7 active spaces initially so solo maintenance takes < 1 hour/week.");
  } else {
    pros.push("Role hierarchy enables assigning volunteer moderators with custom permissions.");
  }

  // 4. Voice & Live Stages
  if (answers.interactionStyle.pace === "live_voice_video" || answers.interactionStyle.pace === "hybrid_balanced") {
    discordScore += 5;
    pros.push("Crystal-clear live voice stages and screen sharing built directly into channels without third-party zoom links.");
  }

  // 5. Budget Consideration
  if (answers.budget.tier === "free_only") {
    pros.push("100% free hosting with zero per-user subscription fees for unlimited members.");
    cons.push("Server audio/video quality boosts are optional micro-purchases (Nitro), though core features remain free.");
  }

  // Trade-offs & Cons
  cons.push("Steeper initial learning curve for non-gamer audiences who are accustomed to standard WhatsApp chat apps.");
  cons.push("Members must create or have a Discord account to join.");

  // Caveats
  if (answers.audienceSize.tier === "large") {
    caveats.push("Requires setting up onboarding verification rules before publishing your invite link to prevent spam bots.");
  }

  // Clamp fit scores
  discordScore = Math.min(98, Math.max(70, discordScore));
  telegramScore = Math.min(85, Math.max(30, telegramScore));
  whatsappScore = Math.min(75, Math.max(20, whatsappScore));

  const headline = `Discord is the optimal foundation for ${answers.communityName}`;
  const rationale = `Based on your goal (${answers.communityGoal.primaryGoal.replace(/_/g, " ")}), audience size (${answers.audienceSize.tier.replace(/_/g, " ")}), and need for structured organization, Discord provides the exact category separation, permission presets, and automated moderation required for a solo creator without recurring platform software fees.`;

  return {
    primaryPlatform: "discord",
    fitScore: discordScore,
    headline,
    rationale,
    tradeoffs: {
      pros,
      cons,
      caveats,
    },
    alternatives: [
      {
        platform: "telegram",
        fitScore: telegramScore,
        reason: "Simpler mobile-first app with high deliverability, but lacks multi-room category organization and granular permission roles.",
      },
      {
        platform: "whatsapp",
        fitScore: whatsappScore,
        reason: "Highest daily open rates, but lacks role hierarchies, channel threading, and exposes phone numbers to all group members.",
      },
    ],
  };
}
