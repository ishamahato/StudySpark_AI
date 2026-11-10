"use client";

import React from "react";
import { X, Key, ShieldCheck, UserCheck } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: "gemini" | "groq" | "mock";
  onProviderChange: (p: "gemini" | "groq" | "mock") => void;
  geminiKey: string;
  onGeminiKeyChange: (k: string) => void;
  groqKey: string;
  onGroqKeyChange: (k: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  provider,
  onProviderChange,
  geminiKey,
  onGeminiKeyChange,
  groqKey,
  onGroqKeyChange,
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="card max-w-md w-full p-6 sm:p-7 space-y-5 [box-shadow:-15px_-15px_40px_var(--neu-light),15px_15px_40px_var(--neu-dark)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--neu-dark)]/40">
          <div className="flex items-center gap-2.5">
            <span className="chip w-8 h-8 rounded-xl">
              <Key className="w-4 h-4 text-neu-accent" />
            </span>
            <h3 className="font-bold text-base text-neu-heading">
              Provider & API Settings
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="button p-2 rounded-full min-h-0 min-w-0 text-neu-heading"
            aria-label="Close settings modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Developer Credit Banner */}
        <div className="inset p-4 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="chip w-8 h-8 rounded-full font-bold text-xs">
              IM
            </span>
            <div>
              <p className="font-bold text-neu-heading">
                Developer: Isha Mahato
              </p>
              <p className="text-[10px] text-neu-text">Active Recall Studio</p>
            </div>
          </div>
          <span className="chip chip--pink text-[10px] px-2.5 py-1 rounded-full font-bold w-auto h-auto">
            Verified Author
          </span>
        </div>

        {/* Security Note */}
        <div className="inset p-3.5 rounded-2xl text-xs text-neu-text flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-neu-accent" />
          <div className="leading-relaxed font-medium">
            API calls are routed securely through serverless endpoints. Keys are verified safely.
          </div>
        </div>

        {/* Provider Switcher */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neu-text">
            Active Model Provider
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: "gemini", label: "Gemini", sub: "2.5 Flash" },
              { id: "groq", label: "Groq", sub: "Qwen 27B" },
              { id: "mock", label: "Mock Mode", sub: "Offline" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onProviderChange(p.id as any)}
                className={`p-3 rounded-2xl text-left transition-all ${
                  provider === p.id
                    ? "inset [box-shadow:inset_-3px_-3px_8px_var(--neu-light),inset_3px_3px_8px_var(--neu-dark)] font-bold text-neu-accent"
                    : "button font-semibold text-neu-heading min-h-0"
                }`}
              >
                <div className="text-xs">{p.label}</div>
                <div className="text-[10px] text-neu-text mt-0.5 font-normal">{p.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Gemini Key Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-neu-heading">
              Gemini API Key
            </label>
            <span className="text-emerald-600 text-[11px] font-semibold flex items-center gap-1">
              • Configured in .env.local
            </span>
          </div>
          <input
            type="password"
            value={geminiKey}
            onChange={(e) => onGeminiKeyChange(e.target.value)}
            placeholder="AIzaSy... (configured in .env.local)"
            className="inset w-full px-4 py-2.5 rounded-full text-xs font-mono text-neu-heading focus:outline-none"
          />
        </div>

        {/* Groq Key Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-neu-heading">
              Groq API Key
            </label>
            <span className="text-emerald-600 text-[11px] font-semibold flex items-center gap-1">
              • Configured in .env.local
            </span>
          </div>
          <input
            type="password"
            value={groqKey}
            onChange={(e) => onGroqKeyChange(e.target.value)}
            placeholder="gsk_... (configured in .env.local)"
            className="inset w-full px-4 py-2.5 rounded-full text-xs font-mono text-neu-heading focus:outline-none"
          />
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="button button--primary px-6 py-2.5 rounded-full text-xs font-bold min-h-0 min-w-0"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
