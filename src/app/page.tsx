"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { InputHero } from "@/components/InputHero";
import { FlashcardsView } from "@/components/FlashcardsView";
import { QuizRunner } from "@/components/QuizRunner";
import {
  SummaryBlock,
  KeyConceptsBlock,
  MasteryChartBlock,
  StudyChecklistBlock,
} from "@/components/BlockViews";
import { RefinementBar } from "@/components/RefinementBar";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { AuthModal } from "@/components/AuthModal";
import { CleanBackground } from "@/components/CleanBackground";
import { FlashcardSkeleton, BentoBlocksSkeleton } from "@/components/LoadingSkeleton";
import { StudySet, AIErrorDetail, SimulationMode } from "@/types/study";
import { AuthUser } from "@/lib/authValidation";
import { MOCK_STUDY_SETS, SAMPLE_NOTES } from "@/lib/mockData";
import {
  GraduationCap,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Download,
  Printer,
} from "lucide-react";

export default function Home() {
  // Theme & Modals
  const [darkMode, setDarkMode] = useState(false);
  const [provider, setProvider] = useState<"gemini" | "groq" | "mock">("gemini");
  const [showHistory, setShowHistory] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Authenticated User State (Developer: Isha Mahato)
  const [user, setUser] = useState<AuthUser | null>(null);

  // Failure Simulation Mode (for Evaluators)
  const [activeSimulation, setActiveSimulation] = useState<SimulationMode>("none");

  // Input & Study Set State
  const [currentNotes, setCurrentNotes] = useState(SAMPLE_NOTES[0].notes);
  const [activeSet, setActiveSet] = useState<StudySet | null>(null);
  const [savedSets, setSavedSets] = useState<StudySet[]>([]);
  const [masteredCardIds, setMasteredCardIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"flashcards" | "quiz" | "blocks">("flashcards");

  // Request & Failure States
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [errorDetail, setErrorDetail] = useState<AIErrorDetail | null>(null);

  // Stale Request Prevention
  const activeRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isTimeoutAbortedRef = useRef<boolean>(false);

  // Initialize Theme, Auth, and Storage
  useEffect(() => {
    // Theme
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Authenticated User Session (Check if user has registered or logged in)
    try {
      const storedUser = localStorage.getItem("studyspark_auth_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.id && parsed.id !== "usr_developer_isha") {
          setUser(parsed);
        } else {
          localStorage.removeItem("studyspark_auth_user");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }

    // Saved Sets
    try {
      const stored = localStorage.getItem("studyspark_saved_sets");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedSets(parsed);
          setActiveSet(parsed[0]);
          return;
        }
      }
    } catch (e) {
      console.warn("Storage load error:", e);
    }

    setActiveSet(MOCK_STUDY_SETS.cellular_respiration);
    setSavedSets([MOCK_STUDY_SETS.cellular_respiration]);
  }, []);

  const handleToggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSignOut = () => {
    setUser(null);
    try {
      localStorage.removeItem("studyspark_auth_user");
    } catch {}
  };

  const saveSetToStorage = (newSet: StudySet) => {
    setSavedSets((prev) => {
      const filtered = prev.filter((s) => s.id !== newSet.id);
      const updated = [newSet, ...filtered];
      try {
        localStorage.setItem("studyspark_saved_sets", JSON.stringify(updated.slice(0, 20)));
      } catch (err) {
        console.warn("Storage save error:", err);
      }
      return updated;
    });
  };

  // Main Generation with 60s Timeout Guard and Race Prevention
  const handleGenerate = async (
    notes: string,
    focus: "all" | "flashcards" | "quiz",
    difficulty: "easy" | "medium" | "hard"
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    isTimeoutAbortedRef.current = false;

    const currentReqId = ++activeRequestIdRef.current;

    setIsLoading(true);
    setErrorDetail(null);

    // Generous 60-second timeout for comprehensive LLM token generation
    const timeoutTimer = setTimeout(() => {
      if (currentReqId === activeRequestIdRef.current) {
        isTimeoutAbortedRef.current = true;
        controller.abort();
        setErrorDetail({
          code: "TIMEOUT",
          message: "Request timed out after 60 seconds.",
          hint: "The AI provider took too long to complete. Try retrying, or switch to Groq / Instant Offline Mode.",
          canRetry: true,
        });
        setIsLoading(false);
      }
    }, 60000);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes,
          provider,
          focus,
          difficulty,
          simulationMode: activeSimulation,
          requestId: currentReqId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutTimer);

      if (currentReqId !== activeRequestIdRef.current) {
        return;
      }

      if (!response.ok && response.status >= 500) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        setErrorDetail(result.error);
        setIsLoading(false);
        return;
      }

      setActiveSet(result.data);
      saveSetToStorage(result.data);
      setMasteredCardIds([]);

      if (activeSimulation !== "none") {
        setActiveSimulation("none");
      }
    } catch (err: any) {
      if (currentReqId !== activeRequestIdRef.current) return;
      if (isTimeoutAbortedRef.current) return; // Preserve TIMEOUT error

      if (err.name === "AbortError") {
        setErrorDetail({
          code: "STALE_REQUEST_ABORTED",
          message: "Generation was superseded or cancelled.",
          hint: "A newer request was initiated or current generation stopped.",
          canRetry: true,
        });
      } else {
        setErrorDetail({
          code: "NETWORK_ERROR",
          message: err?.message || "Unable to connect to study generation endpoint.",
          hint: "Check network connectivity or switch to Instant Offline Mode.",
          canRetry: true,
        });
      }
    } finally {
      clearTimeout(timeoutTimer);
      if (currentReqId === activeRequestIdRef.current && !isTimeoutAbortedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Refinement Handler
  const handleRefine = async (instruction: string) => {
    if (!activeSet) return;
    setIsRefining(true);
    setErrorDetail(null);

    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSet: activeSet,
          instruction,
          provider,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        setErrorDetail(result.error);
        return;
      }

      setActiveSet(result.data);
      saveSetToStorage(result.data);
    } catch (err: any) {
      setErrorDetail({
        code: "SERVER_ERROR",
        message: "Failed to refine study set.",
        hint: "Please retry your refinement prompt.",
        canRetry: true,
      });
    } finally {
      setIsRefining(false);
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  };

  const handleToggleMasteredCard = (cardId: string) => {
    setMasteredCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const handleDeleteSavedSet = (id: string) => {
    setSavedSets((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem("studyspark_saved_sets", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (activeSet?.id === id) {
      const remaining = savedSets.filter((s) => s.id !== id);
      setActiveSet(remaining[0] || null);
    }
  };

  const handleExportJson = () => {
    if (!activeSet) return;
    const blob = new Blob([JSON.stringify(activeSet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeSet.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_study_set.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--neu-base)] text-neu-text transition-colors">
      {/* Educational Background */}
      <CleanBackground />

      {/* Navigation Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenHistory={() => setShowHistory(true)}
        savedCount={savedSets.length}
        user={user}
        onOpenAuth={() => setShowAuth(true)}
        onSignOut={handleSignOut}
      />

      {/* Input Hero Section */}
      <InputHero
        onGenerate={handleGenerate}
        isLoading={isLoading}
        onCancel={handleCancelGeneration}
        currentNotes={currentNotes}
        onNotesChange={setCurrentNotes}
      />

      {/* Main Glass Workspace */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Display Card */}
        {errorDetail && (
          <ErrorDisplay
            error={errorDetail}
            onRetry={() => handleGenerate(currentNotes, "all", "medium")}
            onFallbackToMock={() => {
              setProvider("mock");
              setErrorDetail(null);
              handleGenerate(currentNotes, "all", "medium");
            }}
          />
        )}

        {/* Loading Skeleton Placeholder */}
        {isLoading && !activeSet && (
          <div className="space-y-6">
            <FlashcardSkeleton />
            <BentoBlocksSkeleton />
          </div>
        )}

        {/* Active Study Set Workspace */}
        {activeSet ? (
          <div className="space-y-6">
            {/* Header Neumorphic Bar */}
            <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="chip px-3.5 py-1 text-xs font-bold w-auto h-auto rounded-full">
                    {activeSet.topic}
                  </span>
                  <span className="text-xs font-semibold text-neu-text">
                    {activeSet.flashcards?.length || 0} Flashcards • {activeSet.quiz?.length || 0} Quiz Questions
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neu-heading mt-2">
                  {activeSet.title}
                </h2>
              </div>

              {/* Actions: Export JSON, Print */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="button px-4 py-2 text-xs font-bold flex items-center gap-2 min-h-0 min-w-0"
                  title="Export JSON"
                  aria-label="Export Study Set as JSON"
                >
                  <Download className="w-3.5 h-3.5 text-neu-accent" /> Export JSON
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="button px-4 py-2 text-xs font-bold flex items-center gap-2 min-h-0 min-w-0"
                  title="Print Study Set"
                  aria-label="Print Study Set"
                >
                  <Printer className="w-3.5 h-3.5 text-neu-accent" /> Print
                </button>
              </div>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="inset p-1.5 flex items-center justify-center sm:justify-start gap-1.5 w-fit rounded-full">
              <button
                type="button"
                onClick={() => setActiveTab("flashcards")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === "flashcards"
                    ? "button text-neu-accent shadow-[-4px_-4px_12px_var(--neu-light),4px_4px_12px_var(--neu-dark)]"
                    : "text-neu-text hover:text-neu-heading"
                }`}
              >
                <GraduationCap className="w-4 h-4 text-neu-accent" />
                Flashcards ({activeSet.flashcards?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("quiz")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === "quiz"
                    ? "button text-neu-accent shadow-[-4px_-4px_12px_var(--neu-light),4px_4px_12px_var(--neu-dark)]"
                    : "text-neu-text hover:text-neu-heading"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-neu-accent" />
                Quiz ({activeSet.quiz?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("blocks")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === "blocks"
                    ? "button text-neu-accent shadow-[-4px_-4px_12px_var(--neu-light),4px_4px_12px_var(--neu-dark)]"
                    : "text-neu-text hover:text-neu-heading"
                }`}
              >
                <BookOpen className="w-4 h-4 text-neu-accent" />
                Study Plan & Mastery
              </button>
            </div>

            {/* Tab 1: Flashcards View */}
            {activeTab === "flashcards" && (
              <FlashcardsView
                cards={activeSet.flashcards || []}
                masteredIds={masteredCardIds}
                onToggleMastered={handleToggleMasteredCard}
              />
            )}

            {/* Tab 2: Quiz Runner View */}
            {activeTab === "quiz" && (
              <QuizRunner
                questions={activeSet.quiz || []}
                onQuizCompleted={(score, total) => {
                  console.log(`Quiz completed: ${score}/${total}`);
                }}
              />
            )}

            {/* Tab 3: Synthesis & Study Plan View */}
            {activeTab === "blocks" && (
              <div className="space-y-6">
                <SummaryBlock
                  title={activeSet.title}
                  topic={activeSet.topic}
                  summary={activeSet.summary}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MasteryChartBlock metrics={activeSet.masteryMetrics || []} />
                  <KeyConceptsBlock concepts={activeSet.keyConcepts || []} />
                </div>

                <StudyChecklistBlock tasks={activeSet.studyChecklist || []} />
              </div>
            )}

            {/* AI Refinement Loop */}
            <div className="pt-2">
              <RefinementBar onRefine={handleRefine} isLoading={isRefining} />
            </div>
          </div>
        ) : (
          !isLoading && (
            <div className="card p-12 text-center space-y-3">
              <Sparkles className="w-9 h-9 text-neu-accent mx-auto opacity-70 animate-pulse" />
              <h3 className="font-extrabold text-base text-neu-heading">
                No Study Set Generated Yet
              </h3>
              <p className="text-xs text-neu-text max-w-sm mx-auto">
                Paste notes above or select a sample preset to generate tactile 3D flashcards and quizzes.
              </p>
            </div>
          )
        )}
      </main>

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        savedSets={savedSets}
        onSelectSet={(s) => {
          setActiveSet(s);
          setMasteredCardIds([]);
        }}
        onDeleteSet={handleDeleteSavedSet}
      />

      {/* Email Authentication Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={(newUser) => setUser(newUser)}
      />

      {/* Neumorphic Footer */}
      <footer className="relative z-10 py-8 px-4 text-center text-xs text-neu-text">
        StudySpark • Developed with care by <strong className="text-neu-heading font-semibold">Isha Mahato</strong>
      </footer>
    </div>
  );
}
