import { NextResponse } from "next/server";
import { ApprovalSnapshotSchema } from "@/lib/approvals/types";
import { telegramAdapter } from "@/lib/integrations/telegram/adapter";

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
    const executionResult = await telegramAdapter.executeApprovedPlan(snapshot, {
      botToken: body.botToken,
      chatId: body.chatId,
      chatTitle: body.chatTitle,
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
        error: error instanceof Error ? error.message : "Telegram execution failed",
      },
      { status: 500 }
    );
  }
}
