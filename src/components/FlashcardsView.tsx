"use client";

import React, { useState, useEffect } from "react";
import {
  RotateCw,
  Volume2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Eye,
  EyeOff,
  LayoutGrid,
  Maximize2,
} from "lucide-react";
import { Flashcard } from "@/types/study";

interface FlashcardsViewProps {
  cards: Flashcard[];
  masteredIds: string[];
  onToggleMastered: (cardId: string) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  cards,
  masteredIds,
  onToggleMastered,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [viewMode, setViewMode] = useState<"study" | "grid">("study");
  const [filterConcept, setFilterConcept] = useState<string>("all");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const concepts = Array.from(new Set(cards.map((c) => c.concept || "General")));

  const filteredDeck = cards.filter(
    (c) => filterConcept === "all" || c.concept === filterConcept
  );

  const currentCard = filteredDeck[currentIndex] || cards[0];
  const isCurrentMastered = currentCard ? masteredIds.includes(currentCard.id) : false;

  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
  }, [currentIndex, filterConcept]);

  useEffect(() => {
    if (currentIndex >= filteredDeck.length && filteredDeck.length > 0) {
      setCurrentIndex(0);
    }
  }, [filteredDeck.length, currentIndex]);

  const handleNext = () => {
    if (filteredDeck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredDeck.length);
  };

  const handlePrev = () => {
    if (filteredDeck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredDeck.length) % filteredDeck.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCurrentIndex(Math.floor(Math.random() * filteredDeck.length));
  };

  const handleSpeak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMarkMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentCard) {
      onToggleMastered(currentCard.id);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== "study" || !currentCard) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          handleFlip();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrev();
          break;
        case "Digit1":
        case "KeyM":
          if (isCurrentMastered) {
            onToggleMastered(currentCard.id);
          }
          break;
        case "Digit2":
          if (!isCurrentMastered) {
            onToggleMastered(currentCard.id);
          }
          break;
        case "KeyS":
          handleShuffle();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, currentCard, isCurrentMastered, isFlipped, filteredDeck.length]);

  // Mobile Touch Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext(); // swipe left -> next
      } else {
        handlePrev(); // swipe right -> prev
      }
    }
    setTouchStartX(null);
  };

  if (cards.length === 0) {
    return (
      <div className="card p-12 text-center text-neu-text text-sm">
        No flashcards generated yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls: Filter & View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Concept Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setFilterConcept("all");
              setCurrentIndex(0);
            }}
            className={`button px-4 py-2 text-xs rounded-full min-h-0 min-w-0 transition-all ${
              filterConcept === "all"
                ? "text-neu-accent font-bold [box-shadow:inset_-3px_-3px_8px_var(--neu-light),inset_3px_3px_8px_var(--neu-dark)]"
                : "text-neu-text hover:text-neu-heading font-semibold"
            }`}
          >
            All Cards ({cards.length})
          </button>
          {concepts.map((concept) => {
            const count = cards.filter((c) => c.concept === concept).length;
            const isSelected = filterConcept === concept;
            return (
              <button
                key={concept}
                type="button"
                onClick={() => {
                  setFilterConcept(concept);
                  setCurrentIndex(0);
                }}
                className={`button px-4 py-2 text-xs rounded-full min-h-0 min-w-0 transition-all ${
                  isSelected
                    ? "text-neu-accent font-bold [box-shadow:inset_-3px_-3px_8px_var(--neu-light),inset_3px_3px_8px_var(--neu-dark)]"
                    : "text-neu-text hover:text-neu-heading font-semibold"
                }`}
              >
                {concept} ({count})
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle & Shuffle */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleShuffle}
            className="button p-2.5 rounded-full min-h-0 min-w-0 text-neu-heading"
            title="Shuffle deck [S]"
            aria-label="Shuffle deck"
          >
            <Shuffle className="w-4 h-4 text-neu-accent" />
          </button>

          <div className="inset p-1 rounded-full flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("study")}
              aria-label="Focus 1-by-1 Study Mode"
              className={`p-2 rounded-full transition-all ${
                viewMode === "study"
                  ? "button text-neu-accent min-h-0 min-w-0 shadow-[-2px_-2px_6px_var(--neu-light),2px_2px_6px_var(--neu-dark)]"
                  : "text-neu-text hover:text-neu-heading"
              }`}
              title="Focus 1-by-1 Study Mode"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid Overview Mode"
              className={`p-2 rounded-full transition-all ${
                viewMode === "grid"
                  ? "button text-neu-accent min-h-0 min-w-0 shadow-[-2px_-2px_6px_var(--neu-light),2px_2px_6px_var(--neu-dark)]"
                  : "text-neu-text hover:text-neu-heading"
              }`}
              title="Grid Overview Mode"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {filteredDeck.length === 0 ? (
        <div className="card p-12 text-center text-neu-text text-sm">
          No cards match this filter.
        </div>
      ) : viewMode === "study" ? (
        /* 1-by-1 Study Mode with 3D Flip */
        <div className="flex flex-col items-center">
          {/* Progress Indicator */}
          <div className="w-full max-w-xl flex items-center justify-between text-xs font-semibold text-neu-text mb-2 px-1">
            <span>
              Card {currentIndex + 1} of {filteredDeck.length}
            </span>
            <span className="font-mono">{Math.round(((currentIndex + 1) / filteredDeck.length) * 100)}%</span>
          </div>

          <div className="progress w-full max-w-xl mb-6">
            <div
              className="progress__fill"
              style={{ width: `${((currentIndex + 1) / filteredDeck.length) * 100}%` }}
            />
          </div>

          {/* 3D Flashcard */}
          <div
            onClick={handleFlip}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="button"
            tabIndex={0}
            aria-label={`Flashcard: ${currentCard?.front}. Click or press space to flip.`}
            className="w-full max-w-xl h-72 sm:h-80 perspective-1000 cursor-pointer select-none group focus:outline-none rounded-3xl"
          >
            <div
              className={`relative w-full h-full duration-500 transform-style-preserve-3d transition-transform rounded-3xl ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              {/* FRONT SIDE */}
              <div className="card absolute inset-0 w-full h-full backface-hidden p-6 sm:p-8 flex flex-col justify-between">
                {/* Header */}
                <div className="flex items-center justify-between text-xs">
                  <span className="chip px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xl w-auto h-auto">
                    {currentCard.concept || "Prompt"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleSpeak(currentCard.front, e)}
                      className="button p-2 rounded-full min-h-0 min-w-0 text-neu-heading"
                      title="Read aloud"
                      aria-label="Read prompt aloud"
                    >
                      <Volume2 className="w-4 h-4 text-neu-accent" />
                    </button>
                    {isCurrentMastered && (
                      <span className="chip chip--pink px-2.5 py-1 rounded-xl text-xs font-bold text-neu-heading w-auto h-auto flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neu-accent" /> Mastered
                      </span>
                    )}
                  </div>
                </div>

                {/* Question */}
                <div className="my-auto py-3 text-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-neu-heading leading-relaxed">
                    {currentCard.front}
                  </h3>
                  {currentCard.hint && (
                    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className="inline-flex items-center gap-1 text-xs text-neu-accent hover:underline font-semibold"
                      >
                        {showHint ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showHint ? "Hide hint" : "Show hint"}
                      </button>
                      {showHint && (
                        <p className="mt-2 text-xs text-neu-text italic inset p-3 rounded-xl max-w-sm mx-auto">
                          💡 Hint: {currentCard.hint}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-neu-text pt-3 border-t border-[var(--neu-dark)]/40">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium">
                    <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 text-neu-accent" />
                    Click or Space to flip
                  </span>
                  <span className="capitalize text-[11px] font-semibold text-neu-heading">
                    {currentCard.difficulty || "medium"}
                  </span>
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="card absolute inset-0 w-full h-full backface-hidden rotate-y-180 p-6 sm:p-8 flex flex-col justify-between">
                {/* Header */}
                <div className="flex items-center justify-between text-xs">
                  <span className="chip chip--pink px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xl w-auto h-auto">
                    Answer & Takeaway
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleSpeak(currentCard.back, e)}
                    className="button p-2 rounded-full min-h-0 min-w-0 text-neu-heading"
                    title="Read aloud"
                    aria-label="Read answer aloud"
                  >
                    <Volume2 className="w-4 h-4 text-neu-accent" />
                  </button>
                </div>

                {/* Answer */}
                <div className="my-auto py-3 text-center">
                  <p className="text-base sm:text-xl font-bold text-neu-heading leading-relaxed">
                    {currentCard.back}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-neu-text pt-3 border-t border-[var(--neu-dark)]/40">
                  <span className="text-[11px] text-neu-accent font-bold">Click to flip back</span>
                  <span className="text-[11px] font-medium text-neu-heading">{currentCard.concept}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Controls Bar */}
          <div className="w-full max-w-xl flex items-center justify-between gap-3 mt-6">
            <button
              type="button"
              onClick={handlePrev}
              className="button px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 min-h-0 min-w-0 text-neu-heading"
              title="Previous card [←]"
              aria-label="Previous card"
            >
              <ChevronLeft className="w-4 h-4 text-neu-accent" /> Prev
            </button>

            {/* Mastery Toggle */}
            <button
              type="button"
              onClick={handleMarkMastered}
              className={`button px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 min-h-0 min-w-0 transition-all ${
                isCurrentMastered
                  ? "text-neu-accent [box-shadow:inset_-3px_-3px_8px_var(--neu-light),inset_3px_3px_8px_var(--neu-dark)]"
                  : "text-neu-heading"
              }`}
              aria-label={isCurrentMastered ? "Card is mastered" : "Mark card as mastered"}
            >
              <CheckCircle2
                className={`w-4 h-4 ${isCurrentMastered ? "text-neu-accent" : "text-neu-text"}`}
              />
              {isCurrentMastered ? "Mastered" : "Mark Mastered [2]"}
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="button px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 min-h-0 min-w-0 text-neu-heading"
              title="Next card [→]"
              aria-label="Next card"
            >
              Next <ChevronRight className="w-4 h-4 text-neu-accent" />
            </button>
          </div>

          {/* Shortcut Pills */}
          <div className="hidden sm:flex items-center gap-3 mt-4 text-[11px] text-neu-text font-mono">
            <span>
              <kbd className="inset px-2.5 py-1 rounded-lg text-neu-heading font-bold">Space</kbd> Flip
            </span>
            <span>
              <kbd className="inset px-2.5 py-1 rounded-lg text-neu-heading font-bold">← / →</kbd> Prev/Next
            </span>
            <span>
              <kbd className="inset px-2.5 py-1 rounded-lg text-neu-heading font-bold">2</kbd> Master
            </span>
            <span>
              <kbd className="inset px-2.5 py-1 rounded-lg text-neu-heading font-bold">S</kbd> Shuffle
            </span>
          </div>
        </div>
      ) : (
        /* Grid Mode: Bento Neumorphic Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeck.map((card, idx) => {
            const isMastered = masteredIds.includes(card.id);
            return (
              <div
                key={card.id}
                className="card p-6 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="chip px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-xl w-auto h-auto">
                      #{idx + 1} • {card.concept}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleMastered(card.id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        isMastered ? "text-neu-accent" : "text-neu-text hover:text-neu-heading"
                      }`}
                      title={isMastered ? "Mastered" : "Mark Mastered"}
                      aria-label={isMastered ? "Card mastered" : "Mark mastered"}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-neu-heading text-sm mb-3">
                    {card.front}
                  </h4>
                  <div className="inset p-4 rounded-2xl text-xs text-neu-text leading-relaxed">
                    {card.back}
                  </div>
                </div>
                {card.hint && (
                  <p className="text-[11px] text-neu-text italic">
                    💡 {card.hint}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
