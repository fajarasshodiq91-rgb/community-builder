import { z } from "zod";
import { AuditEventSchema } from "@/lib/audit/types";

export const TelegramConnectionStatusSchema = z.object({
  connected: z.boolean(),
  botUsername: z.string().optional(),
  chatId: z.string().optional(),
  chatTitle: z.string().optional(),
  isForum: z.boolean().default(false),
  canManageTopics: z.boolean().default(false),
  error: z.string().optional(),
});
export type TelegramConnectionStatus = z.infer<typeof TelegramConnectionStatusSchema>;

export const TelegramTopicResultSchema = z.object({
  name: z.string(),
  topicId: z.number().int(),
  category: z.string(),
});
export type TelegramTopicResult = z.infer<typeof TelegramTopicResultSchema>;

export const TelegramExecutionResultSchema = z.object({
  jobId: z.string(),
  status: z.enum(["completed", "partial", "failed"]),
  chatId: z.string(),
  chatTitle: z.string(),
  createdTopics: z.array(TelegramTopicResultSchema),
  skippedTopics: z.array(z.string()),
  auditLog: z.array(AuditEventSchema),
  error: z.string().optional(),
});
export type TelegramExecutionResult = z.infer<typeof TelegramExecutionResultSchema>;
