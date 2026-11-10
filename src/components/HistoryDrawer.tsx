"use client";

import React from "react";
import { X, Trash2, Download, Calendar, Layers } from "lucide-react";
import { StudySet } from "@/types/study";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedSets: StudySet[];
  onSelectSet: (set: StudySet) => void;
  onDeleteSet: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedSets,
  onSelectSet,
  onDeleteSet,
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExport = (set: StudySet, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([JSON.stringify(set, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${set.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_studyset.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-sm sm:max-w-md bg-[var(--neu-base)] text-neu-text [box-shadow:-15px_0_35px_var(--neu-dark)] flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-[var(--neu-dark)]/40 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-neu-heading">
                Recent Study Sets
              </h3>
              <p className="text-xs text-neu-text">{savedSets.length} stored locally</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="button p-2 rounded-full min-h-0 min-w-0 text-neu-heading"
              aria-label="Close history drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {savedSets.length === 0 ? (
              <div className="text-center py-12 text-neu-text text-xs">
                No saved study sessions yet.
                <p className="mt-1">Generated decks are saved automatically.</p>
              </div>
            ) : (
              savedSets.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectSet(s);
                    onClose();
                  }}
                  className="card p-4 rounded-2xl cursor-pointer transition-all group hover:scale-[1.01]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-neu-heading group-hover:text-neu-accent transition-colors line-clamp-1">
                      {s.title}
                    </h4>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleExport(s, e)}
                        className="button p-1.5 rounded-full min-h-0 min-w-0 text-neu-heading"
                        title="Export JSON"
                        aria-label="Export JSON"
                      >
                        <Download className="w-3.5 h-3.5 text-neu-accent" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSet(s.id);
                        }}
                        className="button p-1.5 rounded-full min-h-0 min-w-0 text-red-500 hover:text-red-600"
                        title="Delete set"
                        aria-label="Delete set"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-neu-text line-clamp-2 mt-1.5">{s.summary}</p>

                  <div className="flex items-center justify-between text-[10px] text-neu-text pt-2.5 mt-2.5 border-t border-[var(--neu-dark)]/30">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-neu-accent" />
                      {s.flashcards?.length || 0} cards • {s.quiz?.length || 0} quiz
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
