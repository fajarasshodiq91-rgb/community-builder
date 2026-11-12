import { z } from "zod";

export const WhatsAppGroupSpecSchema = z.object({
  name: z.string(),
  description: z.string(),
  type: z.enum(["announcement", "open_chat", "forum_style"]),
  recommendedSettings: z.object({
    onlyAdminsSendMessages: z.boolean(),
    editGroupInfoOnlyAdmins: z.boolean(),
  }),
});
export type WhatsAppGroupSpec = z.infer<typeof WhatsAppGroupSpecSchema>;

export const WhatsAppCommunityPackageSchema = z.object({
  communityName: z.string(),
  description: z.string(),
  announcementGroup: WhatsAppGroupSpecSchema,
  subGroups: z.array(WhatsAppGroupSpecSchema),
  welcomeBroadcastText: z.string(),
  rulesBroadcastText: z.string(),
  setupChecklist: z.array(z.string()),
});
export type WhatsAppCommunityPackage = z.infer<typeof WhatsAppCommunityPackageSchema>;
