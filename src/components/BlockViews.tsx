"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  CheckSquare,
  BarChart3,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Tag,
} from "lucide-react";
import { KeyConcept, ChecklistTask, MasteryMetric } from "@/types/study";

// 1. EXECUTIVE SYNTHESIS CARD
export const SummaryBlock: React.FC<{ title: string; topic: string; summary: string }> = ({
  title,
  topic,
  summary,
}) => {
  return (
    <div className="card p-6 sm:p-7 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="chip w-9 h-9 rounded-2xl">
            <BookOpen className="w-4 h-4 text-neu-accent" />
          </span>
          <h3 className="font-bold text-base text-neu-heading">
            Executive Synthesis
          </h3>
        </div>
        <span className="chip chip--pink px-3.5 py-1 text-xs font-bold w-auto h-auto rounded-full">
          {topic}
        </span>
      </div>
      <p className="text-xs sm:text-sm text-neu-text leading-relaxed font-medium">
        {summary}
      </p>
    </div>
  );
};

// 2. KEY CONCEPTS GLOSSARY CARD
export const KeyConceptsBlock: React.FC<{ concepts: KeyConcept[] }> = ({ concepts }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = Array.from(new Set(concepts.map((c) => c.category || "Core Concept")));
  const filtered =
    selectedCategory === "all" ? concepts : concepts.filter((c) => c.category === selectedCategory);

  return (
    <div className="card p-6 sm:p-7 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="chip w-9 h-9 rounded-2xl">
            <Tag className="w-4 h-4 text-neu-accent" />
          </span>
          <h3 className="font-bold text-base text-neu-heading">
            Key Concepts Glossary ({concepts.length})
          </h3>
        </div>

        {categories.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`button px-3.5 py-1.5 rounded-full text-xs min-h-0 min-w-0 transition-all ${
                selectedCategory === "all"
                  ? "text-neu-accent font-bold [box-shadow:inset_-2px_-2px_6px_var(--neu-light),inset_2px_2px_6px_var(--neu-dark)]"
                  : "text-neu-text hover:text-neu-heading font-semibold"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`button px-3.5 py-1.5 rounded-full text-xs min-h-0 min-w-0 transition-all ${
                  selectedCategory === cat
                    ? "text-neu-accent font-bold [box-shadow:inset_-2px_-2px_6px_var(--neu-light),inset_2px_2px_6px_var(--neu-dark)]"
                    : "text-neu-text hover:text-neu-heading font-semibold"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="inset p-4 rounded-2xl space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-bold text-xs text-neu-heading">
                {item.term}
              </h4>
              <span className="chip px-2.5 py-0.5 text-[10px] font-mono font-medium rounded-lg w-auto h-auto">
                {item.category}
              </span>
            </div>
            <p className="text-xs text-neu-text leading-relaxed">
              {item.definition}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. TOPIC MASTERY DISTRIBUTION
export const MasteryChartBlock: React.FC<{
  metrics: MasteryMetric[];
}> = ({ metrics }) => {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="card p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="chip w-9 h-9 rounded-2xl">
            <TrendingUp className="w-4 h-4 text-neu-accent" />
          </span>
          <h3 className="font-bold text-base text-neu-heading">
            Topic Mastery Distribution
          </h3>
        </div>
        <span className="text-xs text-neu-text font-semibold">Confidence Scores</span>
      </div>

      <div className="space-y-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neu-heading">
                {m.category}
              </span>
              <span className="font-mono text-neu-accent font-bold">
                {m.confidenceScore}%
              </span>
            </div>
            <div className="progress w-full">
              <div
                className="progress__fill"
                style={{ width: `${m.confidenceScore}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. ACTIONABLE CHECKLIST WITH POMODORO TIMER
export const StudyChecklistBlock: React.FC<{
  tasks: ChecklistTask[];
  onToggleTask?: (taskId: string) => void;
}> = ({ tasks, onToggleTask }) => {
  const [localTasks, setLocalTasks] = useState(tasks);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, pomodoroSeconds]);

  const toggleTask = (id: string) => {
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    if (onToggleTask) onToggleTask(id);
  };

  const totalMinutes = localTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const completedMinutes = localTasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="card p-6 sm:p-7 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="chip w-9 h-9 rounded-2xl">
            <CheckSquare className="w-4 h-4 text-neu-accent" />
          </span>
          <h3 className="font-bold text-base text-neu-heading">
            Actionable Study Plan
          </h3>
        </div>
        <div className="text-xs font-semibold text-neu-text">
          Total Duration: ~{totalMinutes}m ({completedMinutes}m completed)
        </div>
      </div>

      {/* Focus Timer Bar */}
      <div className="inset p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="chip chip--pink w-10 h-10 rounded-2xl">
            <Clock className="w-5 h-5 text-neu-accent" />
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neu-text">
              Focus Pomodoro
            </span>
            <p className="font-mono text-2xl font-black text-neu-heading leading-none mt-1">
              {formatTimer(pomodoroSeconds)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className={`button px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 min-h-0 min-w-0 transition-all ${
              isRunning
                ? "text-amber-600 dark:text-amber-400 [box-shadow:inset_-2px_-2px_6px_var(--neu-light),inset_2px_2px_6px_var(--neu-dark)]"
                : "text-neu-accent font-bold"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-neu-accent" /> Start 25m
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRunning(false);
              setPomodoroSeconds(25 * 60);
            }}
            className="button p-2.5 rounded-full text-neu-text hover:text-neu-heading min-h-0 min-w-0"
            title="Reset timer"
            aria-label="Reset Pomodoro Timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {localTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
              task.completed
                ? "inset text-neu-text opacity-70 line-through"
                : "button text-neu-heading min-h-0"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                  task.completed
                    ? "chip chip--pink"
                    : "inset"
                }`}
              >
                {task.completed && <CheckCircle2 className="w-4 h-4 text-neu-accent" />}
              </div>
              <span className="text-xs sm:text-sm font-semibold">{task.task}</span>
            </div>

            <span className="text-[11px] font-mono text-neu-text shrink-0 font-medium">
              ~{task.estimatedMinutes}m
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
