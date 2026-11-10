"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, Wand2 } from "lucide-react";

interface RefinementBarProps {
  onRefine: (instruction: string) => void;
  isLoading: boolean;
}

const QUICK_PROMPTS = [
  "Add 3 harder quiz questions",
  "Add flashcards for key formulas",
  "Simplify explanations",
  "Add a revision task",
];

export const RefinementBar: React.FC<RefinementBarProps> = ({ onRefine, isLoading }) => {
  const [instruction, setInstruction] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!instruction.trim() || isLoading) return;
    onRefine(instruction);
    setInstruction("");
  };

  return (
    <div className="card p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2.5">
        <span className="chip w-8 h-8 rounded-xl">
          <Wand2 className="w-4 h-4 text-neu-accent" />
        </span>
        <h4 className="text-xs sm:text-sm font-bold text-neu-heading">
          Refine Existing Deck
        </h4>
      </div>

      {/* Quick Prompt Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-neu-text font-semibold">Suggestions:</span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => setInstruction(prompt)}
            className="button px-3.5 py-1 rounded-full text-[11px] text-neu-heading min-h-0 min-w-0 font-medium disabled:opacity-50"
          >
            + {prompt}
          </button>
        ))}
      </div>

      {/* Refine Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          disabled={isLoading}
          placeholder="E.g., 'Add 2 harder questions on glycolysis', 'Add flashcard on oxaloacetate'..."
          className="inset flex-1 px-4 py-2.5 rounded-full text-xs sm:text-sm text-neu-heading focus:outline-none transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!instruction.trim() || isLoading}
          className="button button--primary px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed min-h-0 min-w-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-neu-accent" />
              Refining...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-neu-accent" />
              Refine
            </>
          )}
        </button>
      </form>
    </div>
  );
};
