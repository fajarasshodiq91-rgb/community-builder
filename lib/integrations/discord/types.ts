import { z } from "zod";
import { AuditEventSchema } from "@/lib/audit/types";

export const DiscordConnectionStatusSchema = z.object({
  connected: z.boolean(),
  botName: z.string().optional(),
  guildId: z.string().optional(),
  guildName: z.string().optional(),
  grantedPermissions: z.array(z.string()),
  missingPermissions: z.array(z.string()),
  error: z.string().optional(),
});
export type DiscordConnectionStatus = z.infer<typeof DiscordConnectionStatusSchema>;

export const DiscordExecutionResultSchema = z.object({
  jobId: z.string(),
  status: z.enum(["completed", "partial", "failed"]),
  targetGuildId: z.string(),
  targetGuildName: z.string(),
  summary: z.object({
    rolesCreated: z.number().int().min(0),
    rolesSkipped: z.number().int().min(0),
    categoriesCreated: z.number().int().min(0),
    channelsCreated: z.number().int().min(0),
    channelsSkipped: z.number().int().min(0),
    deletionsAttempted: z.literal(0),
  }),
  createdChannels: z.array(z.string()),
  skippedChannels: z.array(z.string()),
  createdRoles: z.array(z.string()),
  skippedRoles: z.array(z.string()),
  auditLog: z.array(AuditEventSchema),
  errors: z.array(z.string()).optional(),
});
export type DiscordExecutionResult = z.infer<typeof DiscordExecutionResultSchema>;
