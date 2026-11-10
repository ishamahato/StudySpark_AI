import { STUDY_SET_SYSTEM_PROMPT, REFINEMENT_SYSTEM_PROMPT } from "./aiPrompts";
import { generateDynamicMockSet, MOCK_STUDY_SETS, SAMPLE_NOTES } from "./mockData";
import { StudySet } from "@/types/study";

export interface GenerateOptions {
  notes: string;
  provider: "gemini" | "groq" | "mock";
  apiKey?: string;
  focus?: "all" | "flashcards" | "quiz";
  difficulty?: "easy" | "medium" | "hard";
  signal?: AbortSignal;
}

export interface RefineOptions {
  currentSet: StudySet;
  instruction: string;
  provider: "gemini" | "groq" | "mock";
  apiKey?: string;
  signal?: AbortSignal;
}

/**
 * Main service to dispatch study set generation across providers.
 */
export async function generateStudySet(options: GenerateOptions): Promise<string> {
  const { notes, provider, apiKey, focus, difficulty, signal } = options;

  if (provider === "mock") {
    // Check if notes match any pre-canned sample notes
    await new Promise((resolve) => setTimeout(resolve, 800)); // simulate natural AI latency
    const matchedSample = SAMPLE_NOTES.find(
      (s) => notes.includes(s.topic) || notes.slice(0, 50) === s.notes.slice(0, 50)
    );
    if (matchedSample && matchedSample.label.includes("Biology")) {
      return JSON.stringify(MOCK_STUDY_SETS.cellular_respiration);
    }
    const generated = generateDynamicMockSet(notes);
    return JSON.stringify(generated);
  }

  const effectiveKey = apiKey || (provider === "gemini" ? process.env.GEMINI_API_KEY : process.env.GROQ_API_KEY);

  if (!effectiveKey) {
    throw new Error(
      `No API key configured for provider "${provider}". Please add it in .env.local or enter it in the Settings modal.`
    );
  }

  const userPrompt = `SOURCE NOTES TO ANALYZE:\n${notes}\n\nFOCUS: ${focus || "all"}\nTARGET DIFFICULTY: ${
    difficulty || "medium"
  }\n\nGenerate the complete Study Set JSON object now.`;

  if (provider === "gemini") {
    return callGemini(userPrompt, effectiveKey, STUDY_SET_SYSTEM_PROMPT, signal);
  } else if (provider === "groq") {
    return callGroq(userPrompt, effectiveKey, STUDY_SET_SYSTEM_PROMPT, signal);
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

/**
 * Service to refine an existing study set based on user's follow-up instruction.
 */
export async function refineStudySet(options: RefineOptions): Promise<string> {
  const { currentSet, instruction, provider, apiKey, signal } = options;

  if (provider === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Provide an intelligent mock refinement
    const updated = JSON.parse(JSON.stringify(currentSet)) as StudySet;
    const lower = instruction.toLowerCase();

    if (lower.includes("harder") || lower.includes("difficult") || lower.includes("quiz")) {
      updated.quiz.push({
        id: `refine_qz_${Date.now()}`,
        question: `Advanced Follow-up: Analyzing ${updated.topic} under boundary conditions:`,
        options: [
          "Primary rate-limiting factor governed by negative feedback",
          "Unconstrained linear amplification",
          "Total degradation without metabolic recovery",
          "Reversion to primitive anaerobic states",
        ],
        correctIndex: 0,
        explanation: "Refined question generated based on your request for advanced concepts.",
        concept: "Advanced Analysis",
      });
    }

    if (lower.includes("card") || lower.includes("flashcard") || lower.includes("more")) {
      updated.flashcards.push({
        id: `refine_fc_${Date.now()}`,
        front: `Refined concept: What critical caveat applies to ${updated.topic}?`,
        back: `This was generated in response to: "${instruction}". Key details depend on context and application.`,
        hint: "Review the refined notes.",
        concept: "Refinement",
        difficulty: "hard",
      });
    }

    updated.title = `${updated.title} (Refined)`;
    return JSON.stringify(updated);
  }

  const effectiveKey = apiKey || (provider === "gemini" ? process.env.GEMINI_API_KEY : process.env.GROQ_API_KEY);

  if (!effectiveKey) {
    throw new Error(`No API key provided for provider "${provider}".`);
  }

  const userPrompt = `EXISTING STUDY SET JSON:\n${JSON.stringify(currentSet, null, 2)}\n\nUSER REFINEMENT INSTRUCTION:\n${instruction}\n\nReturn the updated and complete Study Set JSON.`;

  if (provider === "gemini") {
    return callGemini(userPrompt, effectiveKey, REFINEMENT_SYSTEM_PROMPT, signal);
  } else if (provider === "groq") {
    return callGroq(userPrompt, effectiveKey, REFINEMENT_SYSTEM_PROMPT, signal);
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

/**
 * Direct fetch call to Google Gemini REST API.
 */
async function callGemini(
  userPrompt: string,
  apiKey: string,
  systemPrompt: string,
  signal?: AbortSignal
): Promise<string> {
  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedError: any = {};
    try {
      parsedError = JSON.parse(errorText);
    } catch {}

    const errorMessage = parsedError?.error?.message || errorText;
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Gemini Authentication Error: Invalid or expired API key. (${errorMessage})`);
    } else if (response.status === 429) {
      throw new Error(`Gemini Rate Limit Exceeded (HTTP 429). Please wait a moment or try again. (${errorMessage})`);
    } else {
      throw new Error(`Gemini API Error (HTTP ${response.status}): ${errorMessage}`);
    }
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned an empty response candidate.");
  }

  return text;
}

/**
 * Direct fetch call to Groq REST API.
 */
async function callGroq(
  userPrompt: string,
  apiKey: string,
  systemPrompt: string,
  signal?: AbortSignal
): Promise<string> {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const model = "qwen/qwen3.8-27b";
  const payload = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedError: any = {};
    try {
      parsedError = JSON.parse(errorText);
    } catch {}

    const errorMessage = parsedError?.error?.message || errorText;
    if (response.status === 401) {
      throw new Error(`Groq Authentication Error: Invalid API key. (${errorMessage})`);
    } else if (response.status === 429) {
      throw new Error(`Groq Rate Limit Exceeded (HTTP 429). (${errorMessage})`);
    } else {
      throw new Error(`Groq API Error (HTTP ${response.status}): ${errorMessage}`);
    }
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("Groq returned an empty response choice.");
  }

  return text;
}

