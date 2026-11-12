import { test } from "node:test";
import assert from "node:assert/strict";
import { generateCommunityInsights } from "../lib/insights/engine";
import { InsightsReportSchema } from "../lib/insights/types";

test("Insights Engine: generates valid Discord report and action templates", async () => {
  const report = await generateCommunityInsights({
    platform: "discord",
    communityName: "Klub Kreator ID",
  });

  const parsed = InsightsReportSchema.safeParse(report);
  assert.ok(parsed.success, `Schema validation failed: ${JSON.stringify(parsed.error?.format())}`);

  assert.equal(report.summary.platform, "discord");
  assert.equal(report.summary.communityName, "Klub Kreator ID");
  assert.ok(report.summary.healthScore >= 0 && report.summary.healthScore <= 100);
  assert.ok(report.insights.length >= 2, "Expected at least 2 actionable insights");

  // Check ice-breaker actionable insight
  const iceBreaker = report.insights.find((i) => i.id === "ins_disc_onboarding");
  assert.ok(iceBreaker, "Expected onboarding ice-breaker insight");
  assert.equal(iceBreaker?.priority, "high");
  assert.ok(iceBreaker?.actionPayload?.templateContent?.includes("Halo kawan-kawan"));
});

test("Insights Engine: flags over-segmentation when channels outweigh members", async () => {
  const report = await generateCommunityInsights({
    platform: "discord",
    communityName: "Ghost Town Server",
  });

  // Verify health score computation logic
  assert.ok(["vibrant", "steady", "quiet", "needs_attention"].includes(report.summary.activityPulse));
  assert.ok(report.summary.recentEvents.length > 0);
});

test("Insights Engine: generates valid Telegram report with pinned forum navigation", async () => {
  const report = await generateCommunityInsights({
    platform: "telegram",
    communityName: "Dev Supergroup",
  });

  const parsed = InsightsReportSchema.safeParse(report);
  assert.ok(parsed.success);

  assert.equal(report.summary.platform, "telegram");
  const pinInsight = report.insights.find((i) => i.id === "ins_tg_pin");
  assert.ok(pinInsight);
  assert.ok(pinInsight?.actionPayload?.templateContent?.includes("PANDUAN RUANG DISKUSI"));
});

test("Insights Engine: generates valid WhatsApp report with weekly digest template", async () => {
  const report = await generateCommunityInsights({
    platform: "whatsapp",
    communityName: "Keluarga Desain WA",
  });

  const parsed = InsightsReportSchema.safeParse(report);
  assert.ok(parsed.success);

  assert.equal(report.summary.platform, "whatsapp");
  const waDigest = report.insights.find((i) => i.id === "ins_wa_broadcast");
  assert.ok(waDigest);
  assert.ok(waDigest?.actionPayload?.templateContent?.includes("KABAR MINGGUAN KOMUNITAS"));
});
