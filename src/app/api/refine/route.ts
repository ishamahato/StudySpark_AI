import { NextRequest, NextResponse } from "next/server";
import { refineStudySet } from "@/lib/aiService";
import { parseAndValidateStudySet } from "@/lib/validation";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentSet, instruction, provider = "mock", apiKey, requestId } = body;

    if (!currentSet || !instruction || !instruction.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMPTY_RESPONSE",
            message: "Missing current study set or refinement instruction.",
            hint: "Please type an instruction (e.g. 'Add 3 more quiz questions on X').",
            canRetry: false,
          },
        },
        { status: 400 }
      );
    }

    let rawAiOutput = "";
    try {
      rawAiOutput = await refineStudySet({
        currentSet,
        instruction,
        provider,
        apiKey,
      });
    } catch (aiErr: any) {
      console.error("[Refine API] AI Service Error:", aiErr);
      return NextResponse.json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: aiErr?.message || "Failed to refine study set.",
          hint: "Check API keys or retry the refinement.",
          canRetry: true,
        },
        requestId,
      });
    }

    const parseResult = parseAndValidateStudySet(rawAiOutput, currentSet.sourceNotes || "");

    return NextResponse.json({
      ...parseResult,
      requestId,
    });
  } catch (error: any) {
    console.error("[Refine API] Unexpected server error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: error?.message || "Unexpected server error during refinement.",
          hint: "Please try again.",
          canRetry: true,
        },
      },
      { status: 500 }
    );
  }
}

