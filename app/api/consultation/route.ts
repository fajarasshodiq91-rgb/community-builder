import { NextResponse } from "next/server";
import {
  validateConsultation,
  generateConsultationSummary,
  prepareRecommendationPayload,
} from "@/lib/discovery/consultation";

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
    const summary = generateConsultationSummary(answers);
    const recommendationPayload = prepareRecommendationPayload(answers);

    return NextResponse.json({
      success: true,
      summary,
      recommendationPayload,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
