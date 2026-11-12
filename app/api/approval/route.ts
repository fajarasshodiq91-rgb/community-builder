import { NextResponse } from "next/server";
import { CommunityBlueprintSchema } from "@/lib/blueprint/types";
import { createApprovalSnapshot, generateChangePreview } from "@/lib/approvals/snapshot";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const check = CommunityBlueprintSchema.safeParse(body.blueprint);

    if (!check.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid blueprint data: " + check.error.issues[0]?.message,
        },
        { status: 400 }
      );
    }

    const snapshot = createApprovalSnapshot(check.data);
    const preview = generateChangePreview(snapshot);

    return NextResponse.json({
      success: true,
      snapshot,
      preview,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create approval snapshot",
      },
      { status: 500 }
    );
  }
}
