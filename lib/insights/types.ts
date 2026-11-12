import { z } from "zod";

export type PlatformType = "discord" | "telegram" | "whatsapp";

export const ActivityPulseSchema = z.enum(["vibrant", "steady", "quiet", "needs_attention"]);
export type ActivityPulse = z.infer<typeof ActivityPulseSchema>;

export const InsightCategorySchema = z.enum([
  "engagement",
  "onboarding",
  "structure",
  "moderation",
  "content",
]);
export type InsightCategory = z.infer<typeof InsightCategorySchema>;

export const InsightPrioritySchema = z.enum(["high", "medium", "low"]);
export type InsightPriority = z.infer<typeof InsightPrioritySchema>;

export const InsightActionTypeSchema = z.enum([
  "copy_template",
  "schedule_event",
  "prune_channels",
  "post_announcement",
  "adjust_roles",
]);
export type InsightActionType = z.infer<typeof InsightActionTypeSchema>;

export const ActivityEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  type: z.enum(["join", "message", "topic_created", "channel_added", "announcement", "voice_active"]),
  description: z.string(),
  channelOrTopic: z.string().optional(),
});
export type ActivityEvent = z.infer<typeof ActivityEventSchema>;

export const CommunityActivitySummarySchema = z.object({
  platform: z.enum(["discord", "telegram", "whatsapp"]),
  communityName: z.string(),
  totalMembers: z.number().int().nonnegative(),
  onlineMembers: z.number().int().nonnegative().optional(),
  channelsCount: z.number().int().nonnegative(),
  rolesCount: z.number().int().nonnegative(),
  healthScore: z.number().min(0).max(100),
  activityPulse: ActivityPulseSchema,
  breakdown: z.object({
    textChannels: z.number().int().nonnegative(),
    voiceChannels: z.number().int().nonnegative(),
    forumTopics: z.number().int().nonnegative(),
    announcementChannels: z.number().int().nonnegative(),
    categoriesCount: z.number().int().nonnegative(),
  }),
  recentEvents: z.array(ActivityEventSchema),
});
export type CommunityActivitySummary = z.infer<typeof CommunityActivitySummarySchema>;

export const ActionableInsightSchema = z.object({
  id: z.string(),
  category: InsightCategorySchema,
  priority: InsightPrioritySchema,
  title: z.string(),
  observation: z.string(),
  impact: z.string(),
  actionRecommendation: z.string(),
  actionType: InsightActionTypeSchema,
  actionPayload: z
    .object({
      templateTitle: z.string().optional(),
      templateContent: z.string().optional(),
      suggestedChannel: z.string().optional(),
      actionButtonLabel: z.string().optional(),
    })
    .optional(),
});
export type ActionableInsight = z.infer<typeof ActionableInsightSchema>;

export const InsightsReportSchema = z.object({
  summary: CommunityActivitySummarySchema,
  insights: z.array(ActionableInsightSchema),
  generatedAt: z.string(),
  source: z.enum(["live_api", "simulation"]),
});
export type InsightsReport = z.infer<typeof InsightsReportSchema>;

export interface InsightInspectionParams {
  platform: PlatformType;
  credentials?: {
    botToken?: string;
    guildId?: string;
    chatId?: string;
  };
  communityName?: string;
  blueprintChannelsCount?: number;
}
