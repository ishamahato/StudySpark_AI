import { StudySet, StudySetSchema, AIErrorDetail, Flashcard, QuizQuestion } from "@/types/study";
import { z } from "zod";

/**
 * Strips markdown code blocks, backticks, preamble or epilogue text from LLM response.
 */
export function extractJsonString(raw: string): string {
  let cleaned = raw.trim();

  // Strip ```json ... ``` or ``` ... ```
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }

  // Find boundaries of JSON object { ... }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

/**
 * Heuristically repairs common LLM JSON syntax errors (trailing commas, truncation, quotes).
 */
export function attemptJsonRepair(jsonString: string): string {
  let repaired = jsonString;

  // 1. Remove trailing commas before closing braces/brackets
  repaired = repaired.replace(/,\s*([}\]])/g, "$1");

  // 2. Fix unescaped control characters
  repaired = repaired.replace(/[\u0000-\u001F]+/g, (match) => {
    if (match === "\n" || match === "\r" || match === "\t") return match;
    return "";
  });

  // 3. Handle unclosed arrays or objects due to token limit truncation
  const openBraces = (repaired.match(/\{/g) || []).length;
  const closeBraces = (repaired.match(/\}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/\]/g) || []).length;

  if (openBraces > closeBraces || openBrackets > closeBrackets) {
    // If it ends abruptly in the middle of a string or field, trim back to the last complete element
    const lastComma = repaired.lastIndexOf(",");
    if (lastComma > 0 && lastComma > repaired.lastIndexOf("}")) {
      repaired = repaired.substring(0, lastComma);
    }

    // Recount after trimming
    const currentOpenBraces = (repaired.match(/\{/g) || []).length;
    const currentCloseBraces = (repaired.match(/\}/g) || []).length;
    const currentOpenBrackets = (repaired.match(/\[/g) || []).length;
    const currentCloseBrackets = (repaired.match(/\]/g) || []).length;

    const missingBrackets = Math.max(0, currentOpenBrackets - currentCloseBrackets);
    const missingBraces = Math.max(0, currentOpenBraces - currentCloseBraces);

    repaired += "]".repeat(missingBrackets);
    repaired += "}".repeat(missingBraces);
  }

  return repaired;
}

/**
 * Normalizes loose AI outputs into strict schema format.
 * (e.g. choice letter "B" to index 1, string numbers to actual numbers, missing IDs).
 */
export function normalizeRawStudyData(rawObj: any, originalNotes: string = ""): any {
  if (!rawObj || typeof rawObj !== "object") {
    throw new Error("Parsed AI output is not a JSON object");
  }

  const normalized: any = { ...rawObj };

  // Set default title if missing
  if (!normalized.title || typeof normalized.title !== "string" || normalized.title.trim() === "") {
    normalized.title = originalNotes.slice(0, 40).replace(/[\r\n]+/g, " ").trim() || "Untitled Study Set";
  }

  // Set default topic if missing
  if (!normalized.topic || typeof normalized.topic !== "string") {
    normalized.topic = "General Subject";
  }

  // Set default summary if missing
  if (!normalized.summary || typeof normalized.summary !== "string") {
    normalized.summary = "Study guide generated from provided notes.";
  }

  normalized.sourceNotes = originalNotes;
  normalized.id = normalized.id || `set_${Date.now()}`;
  normalized.createdAt = normalized.createdAt || new Date().toISOString();

  // Normalize Flashcards (partial recovery of valid cards)
  if (Array.isArray(normalized.flashcards)) {
    const validCards: Flashcard[] = [];
    normalized.flashcards.forEach((card: any, idx: number) => {
      if (!card || typeof card !== "object") return;
      const front = card.front || card.question || card.term || card.q;
      const back = card.back || card.answer || card.definition || card.a;
      if (typeof front === "string" && typeof back === "string" && front.trim() && back.trim()) {
        validCards.push({
          id: card.id || `fc_${idx}_${Date.now()}`,
          front: front.trim(),
          back: back.trim(),
          hint: typeof card.hint === "string" ? card.hint : "",
          concept: typeof card.concept === "string" ? card.concept : "Core",
          difficulty: ["easy", "medium", "hard"].includes(card.difficulty) ? card.difficulty : "medium",
        });
      }
    });
    normalized.flashcards = validCards;
  } else {
    normalized.flashcards = [];
  }

  // Normalize Quiz Questions
  if (Array.isArray(normalized.quiz)) {
    const validQuiz: QuizQuestion[] = [];
    normalized.quiz.forEach((q: any, idx: number) => {
      if (!q || typeof q !== "object") return;
      const questionText = q.question || q.prompt || q.q;
      let rawOptions = q.options || q.choices || q.answers;

      if (!Array.isArray(rawOptions) || rawOptions.length < 2) {
        return; // Skip invalid question structure
      }

      const options = rawOptions.map((opt: any) => String(opt).trim()).filter(Boolean);
      if (options.length < 2) return;

      // Handle correctIndex formatted as "A", "B", "C", "D" or string number
      let correctIdx = 0;
      if (typeof q.correctIndex === "string") {
        const letter = q.correctIndex.trim().toUpperCase();
        if (letter === "A") correctIdx = 0;
        else if (letter === "B") correctIdx = 1;
        else if (letter === "C") correctIdx = 2;
        else if (letter === "D") correctIdx = 3;
        else {
          const parsed = parseInt(letter, 10);
          correctIdx = isNaN(parsed) ? 0 : parsed;
        }
      } else if (typeof q.correctIndex === "number") {
        correctIdx = q.correctIndex;
      } else if (typeof q.answer === "string") {
        // If the AI returned the full answer string instead of index
        const matchIdx = options.findIndex((opt: string) => opt.toLowerCase() === q.answer.toLowerCase());
        correctIdx = matchIdx !== -1 ? matchIdx : 0;
      }

      // Bound check
      if (correctIdx < 0 || correctIdx >= options.length) {
        correctIdx = 0;
      }

      validQuiz.push({
        id: q.id || `qz_${idx}_${Date.now()}`,
        question: String(questionText).trim(),
        options,
        correctIndex: correctIdx,
        explanation: q.explanation || "Correct answer based on the study material.",
        concept: q.concept || "General",
      });
    });
    normalized.quiz = validQuiz;
  } else {
    normalized.quiz = [];
  }

  // Normalize Key Concepts
  if (Array.isArray(normalized.keyConcepts)) {
    normalized.keyConcepts = normalized.keyConcepts
      .filter((k: any) => k && (k.term || k.name) && (k.definition || k.meaning))
      .map((k: any) => ({
        term: String(k.term || k.name).trim(),
        definition: String(k.definition || k.meaning).trim(),
        category: String(k.category || "Core Concept").trim(),
      }));
  } else {
    normalized.keyConcepts = [];
  }

  // Normalize Checklist
  if (Array.isArray(normalized.studyChecklist)) {
    normalized.studyChecklist = normalized.studyChecklist
      .filter((t: any) => t && (t.task || t.title))
      .map((t: any, idx: number) => ({
        id: t.id || `task_${idx}`,
        task: String(t.task || t.title).trim(),
        estimatedMinutes: typeof t.estimatedMinutes === "number" ? Math.max(5, t.estimatedMinutes) : 15,
        completed: Boolean(t.completed),
      }));
  } else {
    normalized.studyChecklist = [];
  }

  // Normalize Mastery Metrics
  if (Array.isArray(normalized.masteryMetrics)) {
    normalized.masteryMetrics = normalized.masteryMetrics
      .filter((m: any) => m && m.category)
      .map((m: any) => ({
        category: String(m.category).trim(),
        totalCount: typeof m.totalCount === "number" ? m.totalCount : 1,
        confidenceScore: typeof m.confidenceScore === "number" ? Math.min(100, Math.max(0, m.confidenceScore)) : 75,
      }));
  } else {
    // Generate default metrics from flashcard/quiz concepts if none provided
    const conceptCounts: Record<string, number> = {};
    (normalized.flashcards || []).forEach((fc: Flashcard) => {
      const c = fc.concept || "Core Concepts";
      conceptCounts[c] = (conceptCounts[c] || 0) + 1;
    });
    normalized.masteryMetrics = Object.entries(conceptCounts).map(([category, count]) => ({
      category,
      totalCount: count,
      confidenceScore: Math.floor(65 + Math.random() * 25),
    }));
  }

  return normalized;
}

/**
 * Result of parsing and validating an AI response.
 */
export type ParseResult =
  | { success: true; data: StudySet; wasRepaired?: boolean }
  | { success: false; error: AIErrorDetail };

/**
 * Robustly parses, heals, normalizes, and validates raw AI text into a StudySet.
 */
export function parseAndValidateStudySet(rawResponse: string, originalNotes: string = ""): ParseResult {
  if (!rawResponse || !rawResponse.trim()) {
    return {
      success: false,
      error: {
        code: "EMPTY_RESPONSE",
        message: "The AI model returned an empty response.",
        hint: "The request might have been cut off or filtered. Try re-submitting with more detailed notes.",
        canRetry: true,
      },
    };
  }

  const extracted = extractJsonString(rawResponse);
  let parsedJson: any = null;
  let wasRepaired = false;

  // Attempt 1: Standard JSON.parse
  try {
    parsedJson = JSON.parse(extracted);
  } catch (initialErr: any) {
    // Attempt 2: Auto-repair syntax
    try {
      const repaired = attemptJsonRepair(extracted);
      parsedJson = JSON.parse(repaired);
      wasRepaired = true;
    } catch (repairErr: any) {
      return {
        success: false,
        error: {
          code: "MALFORMED_JSON",
          message: `Malformed JSON from model: ${initialErr.message}`,
          hint: "The AI produced invalid JSON syntax that could not be parsed. You can retry with a fresh prompt.",
          rawResponse,
          canRetry: true,
          canAutoRepair: true,
        },
      };
    }
  }

  // Attempt 3: Normalize and validate with Zod
  try {
    const normalized = normalizeRawStudyData(parsedJson, originalNotes);
    const validated = StudySetSchema.parse(normalized);

    return {
      success: true,
      data: validated,
      wasRepaired,
    };
  } catch (zodErr: any) {
    if (zodErr instanceof z.ZodError) {
      const fieldIssues = zodErr.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
      return {
        success: false,
        error: {
          code: "SCHEMA_MISMATCH",
          message: `Output did not match expected structure (${fieldIssues})`,
          hint: "The AI returned JSON, but some required fields (e.g. flashcards or quiz questions) were missing or malformed.",
          rawResponse,
          canRetry: true,
        },
      };
    }

    return {
      success: false,
      error: {
        code: "SCHEMA_MISMATCH",
        message: zodErr?.message || "Failed to validate study set schema",
        hint: "Unexpected structure returned by the model.",
        rawResponse,
        canRetry: true,
      },
    };
  }
}

