"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Lightbulb,
  Award,
  ChevronRight,
  RefreshCw,
  Trophy,
  Target,
} from "lucide-react";
import confetti from "canvas-confetti";
import { QuizQuestion } from "@/types/study";

interface QuizRunnerProps {
  questions: QuizQuestion[];
  onQuizCompleted?: (score: number, total: number) => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  questions,
  onQuizCompleted,
}) => {
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [isRetestingWrong, setIsRetestingWrong] = useState(false);

  useEffect(() => {
    setActiveQuestions(questions);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowSummary(false);
    setIsRetestingWrong(false);
  }, [questions]);

  const currentQ = activeQuestions[currentIndex];
  const totalQ = activeQuestions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const score = activeQuestions.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const wrongQuestions = activeQuestions.filter((q) => {
    const ans = selectedAnswers[q.id];
    return ans !== undefined && ans !== q.correctIndex;
  });

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQ || selectedAnswers[currentQ.id] !== undefined) return;

    const newAnswers = {
      ...selectedAnswers,
      [currentQ.id]: optionIndex,
    };
    setSelectedAnswers(newAnswers);

    if (optionIndex === currentQ.correctIndex) {
      try {
        confetti({
          particleCount: 20,
          spread: 45,
          origin: { y: 0.8 },
          colors: ["#04AA6D", "#39B58D", "#D1EFE2"],
        });
      } catch {}
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < totalQ) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSummary(true);
      if (onQuizCompleted) {
        onQuizCompleted(score, totalQ);
      }
      if (score / totalQ >= 0.75) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#04AA6D", "#FF9800", "#2196F3"],
          });
        } catch {}
      }
    }
  };

  const handleRetestWrong = () => {
    if (wrongQuestions.length === 0) return;
    setActiveQuestions(wrongQuestions);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowSummary(false);
    setIsRetestingWrong(true);
  };

  const handleResetFullQuiz = () => {
    setActiveQuestions(questions);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowSummary(false);
    setIsRetestingWrong(false);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="card p-12 text-center text-neu-text text-sm">
        No quiz questions generated for this set.
      </div>
    );
  }

  // Summary / Results Screen
  if (showSummary) {
    const percentage = Math.round((score / totalQ) * 100);
    const passed = percentage >= 70;

    return (
      <div className="max-w-2xl mx-auto card p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Score Header */}
        <div className="text-center space-y-3">
          <div className="chip chip--pink w-16 h-16 rounded-3xl mx-auto">
            {percentage === 100 ? (
              <Trophy className="w-8 h-8 text-amber-500 animate-bounce" />
            ) : passed ? (
              <Award className="w-8 h-8 text-neu-accent" />
            ) : (
              <HelpCircle className="w-8 h-8 text-amber-500" />
            )}
          </div>

          <h3 className="text-2xl font-black text-neu-heading">
            {percentage === 100
              ? "Flawless Mastery! 🌟"
              : passed
              ? "Proficient Understanding 🚀"
              : "Review & Re-test 💡"}
          </h3>

          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-black text-neu-accent">
              {score} / {totalQ}
            </span>
            <span className="text-base font-bold text-neu-text">({percentage}%)</span>
          </div>

          <p className="text-xs text-neu-text max-w-sm mx-auto">
            {isRetestingWrong
              ? "Re-test session complete. Check your results below."
              : wrongQuestions.length > 0
              ? `You missed ${wrongQuestions.length} question(s). Re-test them now to lock in the concepts!`
              : "You mastered every single question in this quiz!"}
          </p>
        </div>

        {/* Action Buttons: Re-test Wrong vs Retake Full */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {wrongQuestions.length > 0 && (
            <button
              type="button"
              onClick={handleRetestWrong}
              className="button w-full sm:w-auto px-6 py-3 rounded-full font-bold text-xs text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-test Wrong Answers Only ({wrongQuestions.length})
            </button>
          )}

          <button
            type="button"
            onClick={handleResetFullQuiz}
            className="button w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-xs text-neu-heading flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-neu-accent" />
            Retake Entire Quiz ({questions.length})
          </button>
        </div>

        {/* Review List */}
        <div className="pt-6 border-t border-[var(--neu-dark)]/30 space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neu-text">
            Detailed Review Breakdown
          </h4>

          {activeQuestions.map((q, idx) => {
            const userAns = selectedAnswers[q.id];
            const isCorrect = userAns === q.correctIndex;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-2xl text-xs transition-all ${
                  isCorrect
                    ? "inset [box-shadow:inset_-3px_-3px_8px_var(--neu-light),inset_3px_3px_8px_rgba(32,164,119,0.25)]"
                    : "inset [box-shadow:inset_-3px_-3px_8px_var(--neu-light),inset_3px_3px_8px_rgba(228,93,104,0.25)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neu-heading">#{idx + 1}</span>
                    <h5 className="font-bold text-neu-heading">{q.question}</h5>
                  </div>
                  {isCorrect ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-red-500 shrink-0">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )}
                </div>

                <div className="space-y-1 pl-3 border-l-2 border-[var(--neu-dark)]/50 text-[11px] mt-2">
                  <p className="text-neu-text">
                    <strong className="text-neu-heading">Your choice:</strong>{" "}
                    {userAns !== undefined ? q.options[userAns] : "Not answered"}
                  </p>
                  {!isCorrect && (
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      <strong>Correct answer:</strong> {q.options[q.correctIndex]}
                    </p>
                  )}
                  <p className="text-neu-text italic mt-1">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Question Card
  const userChoice = selectedAnswers[currentQ.id];
  const answered = userChoice !== undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Quiz Progress & Remediate Notice */}
      <div className="flex items-center justify-between text-xs font-semibold text-neu-text px-1">
        <span className="flex items-center gap-1.5">
          {isRetestingWrong ? (
            <span className="chip chip--pink px-2.5 py-0.5 rounded-full text-amber-700 dark:text-amber-300 font-bold text-[10px] w-auto h-auto">
              Remediation Mode ({activeQuestions.length} remaining)
            </span>
          ) : (
            <span>
              Question {currentIndex + 1} of {totalQ}
            </span>
          )}
        </span>
        <span className="font-mono">
          Score: <strong className="text-neu-accent">{score}</strong> / {answeredCount}
        </span>
      </div>

      <div className="progress w-full">
        <div
          className="progress__fill"
          style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="card p-6 sm:p-8 space-y-6">
        <div>
          <span className="chip px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xl w-auto h-auto">
            <Target className="w-3 h-3 mr-1 text-neu-accent" /> {currentQ.concept || "Concept Check"}
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-neu-heading mt-3 leading-snug">
            {currentQ.question}
          </h3>
        </div>

        {/* Option Cards */}
        <div className="space-y-3.5">
          {currentQ.options.map((option, idx) => {
            const isSelected = userChoice === idx;
            const isCorrect = idx === currentQ.correctIndex;

            let cardStyle =
              "button w-full p-4 rounded-2xl text-left text-xs sm:text-sm flex items-start gap-3.5 text-neu-heading transition-all";

            if (answered) {
              if (isCorrect) {
                cardStyle =
                  "inset w-full p-4 rounded-2xl text-left text-xs sm:text-sm flex items-start gap-3.5 text-emerald-700 dark:text-emerald-300 [box-shadow:inset_-4px_-4px_10px_var(--neu-light),inset_4px_4px_10px_rgba(32,164,119,0.3)]";
              } else if (isSelected) {
                cardStyle =
                  "inset w-full p-4 rounded-2xl text-left text-xs sm:text-sm flex items-start gap-3.5 text-red-600 dark:text-red-400 [box-shadow:inset_-4px_-4px_10px_var(--neu-light),inset_4px_4px_10px_rgba(228,93,104,0.3)]";
              } else {
                cardStyle = "w-full p-4 rounded-2xl text-left text-xs sm:text-sm flex items-start gap-3.5 opacity-40 text-neu-text";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={answered}
                className={`${cardStyle} min-h-0 min-w-0`}
              >
                <span
                  className={`chip w-7 h-7 rounded-lg text-xs font-bold shrink-0 ${
                    answered && isCorrect
                      ? "text-emerald-700 dark:text-emerald-300 font-extrabold"
                      : answered && isSelected
                      ? "chip--pink text-red-600 font-extrabold"
                      : ""
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 font-semibold leading-relaxed pt-0.5">{option}</span>
                {answered && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {answered && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Card */}
        {answered && (
          <div className="inset p-4 rounded-2xl space-y-1">
            <p className="text-xs font-bold text-neu-accent flex items-center gap-1.5 mb-1">
              <Lightbulb className="w-3.5 h-3.5" /> Explanation
            </p>
            <p className="text-xs sm:text-sm text-neu-text leading-relaxed font-medium">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Next Question CTA */}
        {answered && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleNextQuestion}
              className="button button--primary px-7 py-3 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2"
            >
              {currentIndex + 1 < totalQ ? "Next Question" : "View Results"}
              <ChevronRight className="w-4 h-4 text-neu-accent" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
