import { NextResponse } from "next/server";
import { ApprovalSnapshotSchema } from "@/lib/approvals/types";
import { generateWhatsAppCommunityPackage } from "@/lib/integrations/whatsapp/generator";

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

    const pkg = generateWhatsAppCommunityPackage(check.data.blueprint);

    return NextResponse.json({
      success: true,
      whatsappPackage: pkg,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate WhatsApp package",
      },
      { status: 500 }
    );
  }
}
