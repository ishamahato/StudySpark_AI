import { NextRequest, NextResponse } from "next/server";
import { generateStudySet } from "@/lib/aiService";
import { parseAndValidateStudySet } from "@/lib/validation";
import { getSimulatedResponse } from "@/lib/simulator";
import { SimulationMode } from "@/types/study";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      notes,
      provider = "mock",
      apiKey,
      focus = "all",
      difficulty = "medium",
      simulationMode = "none" as SimulationMode,
      requestId,
    } = body;

    // 1. Check for Edge Case Simulation Mode (Evaluator Testing)
    if (simulationMode && simulationMode !== "none") {
      const sim = getSimulatedResponse(simulationMode);
      if (sim.simulated) {
        if (sim.delayMs) {
          await new Promise((resolve) => setTimeout(resolve, sim.delayMs));
        }

        if (sim.status && sim.status >= 400) {
          return new NextResponse(sim.rawBody || "Simulated Error", {
            status: sim.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Return simulated raw text (e.g. malformed JSON or schema mismatch)
        const parseResult = parseAndValidateStudySet(sim.rawBody || "", notes || "");
        return NextResponse.json({
          ...parseResult,
          requestId,
          isSimulated: true,
        });
      }
    }

    // 2. Validate input
    if (!notes || typeof notes !== "string" || !notes.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMPTY_RESPONSE",
            message: "No notes or topic provided.",
            hint: "Please paste your notes, lecture transcript, or study topic into the text box.",
            canRetry: false,
          },
        },
        { status: 400 }
      );
    }

    if (notes.length > 50000) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SCHEMA_MISMATCH",
            message: "Input notes exceed maximum allowed length (50,000 characters).",
            hint: "Please shorten your input or break it into smaller study chapters.",
            canRetry: false,
          },
        },
        { status: 400 }
      );
    }

    // 3. Call AI Service (Gemini, Groq, or Mock)
    let rawAiOutput = "";
    try {
      rawAiOutput = await generateStudySet({
        notes,
        provider,
        apiKey,
        focus,
        difficulty,
      });
    } catch (aiErr: any) {
      console.error("[Generate API] AI Service Error:", aiErr);
      const msg = aiErr?.message || "Error communicating with AI model";
      const isAuth = msg.includes("Authentication") || msg.includes("API key");
      const isRate = msg.includes("Rate Limit") || msg.includes("429");

      return NextResponse.json(
        {
          success: false,
          error: {
            code: isAuth ? "AUTH_ERROR" : isRate ? "RATE_LIMIT" : "SERVER_ERROR",
            message: msg,
            hint: isAuth
              ? "Check that your API key is valid and has sufficient quota."
              : isRate
              ? "The provider is rate-limiting calls. Switch to Mock Mode or wait 30 seconds."
              : "Upstream provider error. Try switching to Mock Mode or retrying.",
            canRetry: true,
          },
          requestId,
        },
        { status: 200 } // Keep 200 so frontend receives structured error payload
      );
    }

    // 4. Robust Schema Validation & Auto-Repair
    const parseResult = parseAndValidateStudySet(rawAiOutput, notes);

    return NextResponse.json({
      ...parseResult,
      requestId,
    });
  } catch (error: any) {
    console.error("[Generate API] Unexpected server error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: error?.message || "An unexpected server error occurred.",
          hint: "Check server logs or retry your request.",
          canRetry: true,
        },
      },
      { status: 500 }
    );
  }
}

