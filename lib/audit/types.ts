import { z } from "zod";

export const AuditEventSchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  snapshotId: z.string(),
  action: z.enum([
    "approval_granted",
    "permission_verified",
    "collision_check",
    "role_created",
    "role_skipped",
    "category_created",
    "channel_created",
    "channel_skipped",
    "execution_completed",
    "execution_failed",
  ]),
  targetResource: z.string(),
  outcome: z.enum(["success", "skipped", "failed"]),
  details: z.string(),
  providerResourceId: z.string().optional(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;
