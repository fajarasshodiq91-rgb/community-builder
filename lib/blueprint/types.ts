import { z } from "zod";

export const ChannelSchema = z.object({
  name: z.string().min(1).max(100),
  purpose: z.string().min(1).max(500),
  kind: z.enum(["text", "voice", "announcement", "forum"]),
});

export const CategorySchema = z.object({
  name: z.string().min(1).max(100),
  channels: z.array(ChannelSchema).max(50),
});

export const RoleSchema = z.object({
  name: z.string().min(1).max(100),
  purpose: z.string().min(1).max(500),
  // Intent labels only. Provider adapters map these to supported permissions.
  permissionPreset: z.enum(["owner", "moderator", "member", "read_only"]),
});

export const CommunityBlueprintSchema = z.object({
  version: z.literal(1),
  communityName: z.string().min(1).max(100),
  recommendedPlatform: z.enum(["discord", "telegram", "whatsapp", "multi_platform"]),
  recommendationRationale: z.string().min(1).max(2000),
  categories: z.array(CategorySchema).max(30),
  roles: z.array(RoleSchema).max(30),
  onboarding: z.array(z.string().min(1).max(500)).max(20),
  moderationGuidelines: z.array(z.string().min(1).max(500)).max(30),
  assumptions: z.array(z.string().min(1).max(500)).max(20),
});

export type CommunityBlueprint = z.infer<typeof CommunityBlueprintSchema>;
