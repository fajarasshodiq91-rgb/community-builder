import { NextResponse } from "next/server";
import { validateConsultation } from "@/lib/discovery/consultation";
import { evaluatePlatformRecommendation } from "@/lib/recommendations/engine";
import { generateCommunityBlueprint } from "@/lib/blueprint/generator";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = validateConsultation(body);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || "Invalid consultation answers format",
        },
        { status: 400 }
      );
    }

    const answers = validation.data;
    const recommendation = evaluatePlatformRecommendation(answers);
    const blueprint = generateCommunityBlueprint(answers, recommendation);

    return NextResponse.json({
      success: true,
      recommendation,
      blueprint,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error during blueprint generation",
      },
      { status: 500 }
    );
  }
}
