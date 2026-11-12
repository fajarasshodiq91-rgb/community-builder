import { NextRequest, NextResponse } from "next/server";
import { generateCommunityInsights } from "@/lib/insights/engine";
import { InsightInspectionParams } from "@/lib/insights/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const platform = body.platform || "discord";
    const credentials = body.credentials || {};
    const communityName = body.communityName || "Creator Community";

    const params: InsightInspectionParams = {
      platform,
      credentials,
      communityName,
    };

    const report = await generateCommunityInsights(params);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate community insights";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
