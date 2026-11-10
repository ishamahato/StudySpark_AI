import { SimulationMode } from "@/types/study";

export interface SimulationResult {
  simulated: boolean;
  status?: number;
  rawBody?: string;
  delayMs?: number;
}

export function getSimulatedResponse(mode: SimulationMode): SimulationResult {
  switch (mode) {
    case "malformed_json":
      return {
        simulated: true,
        status: 200,
        rawBody: `Here is your study set in JSON format:\n\`\`\`json\n{\n  "title": "Cellular Respiration Incomplete",\n  "topic": "Biology",\n  "flashcards": [\n    {\n      "front": "What is ATP?",\n      "back": "Adenosine Triphosphate, the energy currency",\n  // SYNTAX ERROR: unclosed quotes and missing braces\n`,
      };

    case "schema_mismatch":
      return {
        simulated: true,
        status: 200,
        rawBody: JSON.stringify({
          wrongRootProperty: "This is not a StudySet",
          errorLevel: 999,
          flashcards: "String instead of array of objects",
          quiz: { notAnArray: true },
        }),
      };

    case "timeout":
      return {
        simulated: true,
        delayMs: 20000, // Client AbortController will trigger timeout after 15s
        status: 200,
        rawBody: "{}",
      };

    case "rate_limit":
      return {
        simulated: true,
        status: 429,
        rawBody: JSON.stringify({
          error: "Rate limit exceeded (HTTP 429). You have made too many requests in a short period.",
        }),
      };

    case "server_error":
      return {
        simulated: true,
        status: 500,
        rawBody: JSON.stringify({
          error: "Internal Model Gateway Error (HTTP 500). Upstream LLM provider is temporarily overloaded.",
        }),
      };

    case "empty_response":
      return {
        simulated: true,
        status: 200,
        rawBody: "",
      };

    default:
      return { simulated: false };
  }
}

