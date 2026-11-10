"use client";

import React, { useState, useEffect } from "react";
import { Brain, Sparkles, X, FileText, ArrowRight, Loader2, StopCircle, AlertCircle } from "lucide-react";
import { SAMPLE_NOTES } from "@/lib/mockData";

interface InputHeroProps {
  onGenerate: (notes: string, focus: "all" | "flashcards" | "quiz", difficulty: "easy" | "medium" | "hard") => void;
  isLoading: boolean;
  onCancel: () => void;
  currentNotes: string;
  onNotesChange: (val: string) => void;
}

const LOADING_STEPS = [
  "Analyzing notes & distilling concepts...",
  "Synthesizing key definitions...",
  "Authoring 3D active recall cards...",
  "Constructing adaptive quiz questions...",
  "Refining concepts & preparing study deck...",
];

export const InputHero: React.FC<InputHeroProps> = ({
  onGenerate,
  isLoading,
  onCancel,
  currentNotes,
  onNotesChange,
}) => {
  const [focus, setFocus] = useState<"all" | "flashcards" | "quiz">("all");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setLoadingStepIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1 < LOADING_STEPS.length ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleInputChange = (val: string) => {
    onNotesChange(val);
    if (validationError && val.trim()) {
      setValidationError(null);
    }
  };

  const handleQuickFill = (notes: string) => {
    onNotesChange(notes);
    setValidationError(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    if (!currentNotes.trim()) {
      setValidationError("Please enter or paste study notes before generating.");
      return;
    }

    setValidationError(null);
    onGenerate(currentNotes, focus, difficulty);
  };

  const wordCount = currentNotes.trim() ? currentNotes.trim().split(/\s+/).length : 0;

  return (
    <section className="relative z-10 w-full py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-7">
        {/* Title & Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full chip text-xs font-semibold">
            <Brain className="w-4 h-4 text-[var(--neu-accent)]" />
            <span>Active Recall Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--neu-heading)] leading-tight">
            Turn Any Material Into an{" "}
            <span className="text-[var(--neu-accent)]">
              Interactive Study Deck
            </span>
          </h1>
          <p className="text-sm text-[var(--neu-text)] max-w-xl mx-auto leading-relaxed">
            Paste notes, transcripts, or topics. StudySpark sculpts them into embossed 3D flashcards,
            remediation quizzes, and structured study plans.
          </p>
        </div>

        {/* Primary Raised Neumorphic Card */}
        <div className="card p-6 sm:p-8 space-y-5">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold text-[var(--neu-heading)] flex items-center gap-1.5 mr-1">
              <FileText className="w-3.5 h-3.5 text-[var(--neu-accent)]" /> Presets:
            </span>
            {SAMPLE_NOTES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickFill(sample.notes)}
                className="button text-xs py-1.5 px-3.5 font-medium disabled:opacity-50"
                aria-label={`Load preset ${sample.label.split(":")[0]}`}
              >
                {sample.label.split(":")[0]}
              </button>
            ))}
          </div>

          {/* Debossed Textarea */}
          <div className="relative">
            <textarea
              value={currentNotes}
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={isLoading}
              rows={5}
              placeholder="Paste lecture notes, study guide, or topic overview here..."
              className={`w-full p-4 rounded-2xl inset text-[var(--neu-heading)] placeholder-[var(--neu-text)]/60 text-sm leading-relaxed resize-y min-h-[140px] focus:outline-none transition-all ${
                validationError ? "ring-2 ring-rose-500/50" : ""
              }`}
              aria-label="Study notes input"
            />
            {currentNotes && !isLoading && (
              <button
                type="button"
                onClick={() => handleInputChange("")}
                className="absolute top-3.5 right-3.5 p-2 rounded-full button text-[var(--neu-text)] hover:text-[var(--neu-heading)]"
                title="Clear content"
                aria-label="Clear notes text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Inline Validation Alert */}
          {validationError && (
            <div
              role="alert"
              className="text-xs text-rose-500 flex items-center gap-1.5 font-bold animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Bottom Bar: Wordcount, Difficulty, & Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Left: Metadata & Difficulty */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--neu-text)]">
              <span className="font-semibold">{wordCount} words</span>
              <span className="opacity-40">•</span>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[var(--neu-heading)]">Difficulty:</span>
                {(["easy", "medium", "hard"] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`px-3 py-1 text-xs capitalize font-bold rounded-full transition-all ${
                      difficulty === diff
                        ? "inset text-[var(--neu-accent)]"
                        : "button text-[var(--neu-text)]"
                    }`}
                    aria-label={`Set difficulty to ${diff}`}
                    aria-pressed={difficulty === diff}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Primary Action Button */}
            <div className="flex items-center gap-3">
              {isLoading ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="button text-xs text-rose-600 font-bold flex items-center justify-center gap-2 w-full sm:w-auto"
                  aria-label="Cancel study deck generation"
                >
                  <StopCircle className="w-4 h-4" />
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="button button--primary text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
                  aria-label="Generate interactive study deck"
                >
                  <Sparkles className="w-4 h-4 text-[var(--neu-accent)]" />
                  <span>Generate Deck</span>
                  <ArrowRight className="w-4 h-4 hidden sm:inline" />
                </button>
              )}
            </div>
          </div>

          {/* Neumorphic Inset Progress Indicator */}
          {isLoading && (
            <div className="pt-3 space-y-2 animate-in fade-in duration-200">
              <div className="flex justify-between items-center text-xs font-bold text-[var(--neu-heading)]">
                <span>{LOADING_STEPS[loadingStepIdx]}</span>
                <span className="font-mono text-[var(--neu-accent)]">
                  {loadingStepIdx + 1}/{LOADING_STEPS.length}
                </span>
              </div>
              <div className="progress">
                <div
                  className="progress__fill"
                  style={{ width: `${((loadingStepIdx + 1) / LOADING_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
