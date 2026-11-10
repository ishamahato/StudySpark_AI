import { z } from "zod";

// Flashcard Schema
export const FlashcardSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  front: z.string().min(1, "Question or term cannot be empty"),
  back: z.string().min(1, "Answer or explanation cannot be empty"),
  hint: z.string().optional().default(""),
  concept: z.string().optional().default("General"),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
});

export type Flashcard = z.infer<typeof FlashcardSchema>;

// Quiz Question Schema
export const QuizQuestionSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  question: z.string().min(1, "Quiz question cannot be empty"),
  options: z.array(z.string()).min(2, "Must have at least 2 options"),
  correctIndex: z.preprocess((val) => {
    if (typeof val === "string") {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return typeof val === "number" ? val : 0;
  }, z.number().int().min(0)),
  explanation: z.string().default("No explanation provided."),
  concept: z.string().optional().default("General"),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

// Key Concept / Term Schema
export const KeyConceptSchema = z.object({
  term: z.string().min(1),
  definition: z.string().min(1),
  category: z.string().optional().default("Core Concept"),
});

export type KeyConcept = z.infer<typeof KeyConceptSchema>;

// Study Checklist Task Schema
export const ChecklistTaskSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  task: z.string().min(1),
  estimatedMinutes: z.number().int().positive().default(15),
  completed: z.boolean().default(false),
});

export type ChecklistTask = z.infer<typeof ChecklistTaskSchema>;

// Mastery Metric Schema
export const MasteryMetricSchema = z.object({
  category: z.string(),
  totalCount: z.number().int().nonnegative().default(1),
  confidenceScore: z.number().min(0).max(100).default(70),
});

export type MasteryMetric = z.infer<typeof MasteryMetricSchema>;

// Master StudySet Schema
export const StudySetSchema = z.object({
  id: z.string().default(() => `set_${Date.now()}`),
  title: z.string().min(1).default("Untitled Study Set"),
  topic: z.string().min(1).default("General Knowledge"),
  summary: z.string().min(1).default("Summary not generated."),
  sourceNotes: z.string().default(""),
  createdAt: z.string().default(() => new Date().toISOString()),
  keyConcepts: z.array(KeyConceptSchema).default([]),
  flashcards: z.array(FlashcardSchema).min(1, "At least one flashcard is required"),
  quiz: z.array(QuizQuestionSchema).min(1, "At least one quiz question is required"),
  studyChecklist: z.array(ChecklistTaskSchema).default([]),
  masteryMetrics: z.array(MasteryMetricSchema).default([]),
});

export type StudySet = z.infer<typeof StudySetSchema>;

// Refinement Request Schema
export const RefinementRequestSchema = z.object({
  instruction: z.string().min(2, "Instruction is too short"),
  currentSet: StudySetSchema,
  provider: z.enum(["gemini", "groq", "mock"]).default("mock"),
  apiKey: z.string().optional(),
});

export type RefinementRequest = z.infer<typeof RefinementRequestSchema>;

// AI Error Classification
export type AIErrorCode =
  | "MALFORMED_JSON"
  | "SCHEMA_MISMATCH"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "AUTH_ERROR"
  | "EMPTY_RESPONSE"
  | "STALE_REQUEST_ABORTED"
  | "SERVER_ERROR";

export interface AIErrorDetail {
  code: AIErrorCode;
  message: string;
  hint: string;
  rawResponse?: string;
  canRetry: boolean;
  canAutoRepair?: boolean;
}

// User Study Progress State
export interface UserStudyProgress {
  setId: string;
  masteredFlashcardIds: string[];
  quizAnswers: Record<string, number>; // questionId -> chosen option index
  quizCompleted: boolean;
  quizScore: number;
  completedTaskIds: string[];
  lastStudiedAt: string;
}

// Edge case simulation types for testing
export type SimulationMode =
  | "none"
  | "malformed_json"
  | "schema_mismatch"
  | "timeout"
  | "rate_limit"
  | "empty_response"
  | "server_error"
  | "stale_race";

