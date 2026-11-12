import { NextResponse } from "next/server";
import { ApprovalSnapshotSchema } from "@/lib/approvals/types";
import { discordAdapter } from "@/lib/integrations/discord/adapter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const check = ApprovalSnapshotSchema.safeParse(body.snapshot);

    if (!check.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid approval snapshot: " + check.error.issues[0]?.message,
        },
        { status: 400 }
      );
    }

    const snapshot = check.data;
    const executionResult = await discordAdapter.executeApprovedPlan(snapshot, {
      guildName: body.guildName,
      guildId: body.guildId,
      botToken: body.botToken,
      dryRun: Boolean(body.dryRun),
    });

    return NextResponse.json({
      success: true,
      executionResult,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Execution failed",
      },
      { status: 500 }
    );
  }
}
