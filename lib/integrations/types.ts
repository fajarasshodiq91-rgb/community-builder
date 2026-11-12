import { z } from "zod";

export const SupportedPlatformEnum = z.enum(["discord", "telegram", "whatsapp"]);
export type SupportedPlatform = z.infer<typeof SupportedPlatformEnum>;

export interface PlatformConnectionContract {
  platform: SupportedPlatform;
  connected: boolean;
  name: string;
  identifier?: string;
  capabilities: {
    canCreateChannels: boolean;
    canCreateRoles: boolean;
    canSetPermissions: boolean;
    automationLevel: "full_api" | "bot_assisted" | "guided_manual";
  };
}
