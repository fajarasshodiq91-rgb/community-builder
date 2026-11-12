import { z } from "zod";

export const PlatformEnum = z.enum(["discord", "telegram", "whatsapp"]);
export type Platform = z.infer<typeof PlatformEnum>;

export const PlatformTradeoffSchema = z.object({
  pros: z.array(z.string().min(1)),
  cons: z.array(z.string().min(1)),
  caveats: z.array(z.string().min(1)),
});
export type PlatformTradeoff = z.infer<typeof PlatformTradeoffSchema>;

export const PlatformRecommendationSchema = z.object({
  primaryPlatform: PlatformEnum,
  fitScore: z.number().int().min(1).max(100),
  headline: z.string().min(1).max(300),
  rationale: z.string().min(1).max(2000),
  tradeoffs: PlatformTradeoffSchema,
  alternatives: z.array(
    z.object({
      platform: PlatformEnum,
      fitScore: z.number().int().min(1).max(100),
      reason: z.string().min(1).max(500),
    })
  ),
});

export type PlatformRecommendation = z.infer<typeof PlatformRecommendationSchema>;
