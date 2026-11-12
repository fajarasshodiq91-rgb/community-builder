import { z } from "zod";
import { CommunityBlueprintSchema } from "@/lib/blueprint/types";

export const ApprovalSnapshotSchema = z.object({
  id: z.string().min(1),
  blueprintHash: z.string().min(16),
  approvedAt: z.string().datetime(),
  version: z.literal(1),
  blueprint: CommunityBlueprintSchema,
  creatorConfirmed: z.boolean(),
});
export type ApprovalSnapshot = z.infer<typeof ApprovalSnapshotSchema>;

export const PlannedChannelOperationSchema = z.object({
  action: z.enum(["create_channel", "skip_existing"]),
  categoryName: z.string(),
  channelName: z.string(),
  kind: z.enum(["text", "voice", "announcement", "forum"]),
  purpose: z.string(),
  targetRoleAccess: z.string(),
});
export type PlannedChannelOperation = z.infer<typeof PlannedChannelOperationSchema>;

export const PlannedRoleOperationSchema = z.object({
  action: z.enum(["create_role", "skip_existing"]),
  roleName: z.string(),
  permissionPreset: z.enum(["owner", "moderator", "member", "read_only"]),
  purpose: z.string(),
});
export type PlannedRoleOperation = z.infer<typeof PlannedRoleOperationSchema>;

export const ChangePreviewSchema = z.object({
  snapshotId: z.string(),
  blueprintHash: z.string(),
  targetPlatform: z.literal("discord"),
  summary: z.object({
    categoriesToCreate: z.number().int().min(0),
    channelsToCreate: z.number().int().min(0),
    rolesToCreate: z.number().int().min(0),
    deletionsCount: z.literal(0), // Safety invariant: deletions are strictly 0
  }),
  plannedCategories: z.array(z.string()),
  plannedChannels: z.array(PlannedChannelOperationSchema),
  plannedRoles: z.array(PlannedRoleOperationSchema),
  safetyInvariants: z.array(z.string()),
});
export type ChangePreview = z.infer<typeof ChangePreviewSchema>;
