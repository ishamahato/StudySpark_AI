"use client";

import React, { useState } from "react";
import { GraduationCap, BookOpen, Sun, Moon, LogOut, ShieldCheck, ChevronDown } from "lucide-react";
import { AuthUser } from "@/lib/authValidation";

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenHistory: () => void;
  savedCount: number;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenHistory,
  savedCount,
  user,
  onOpenAuth,
  onSignOut,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--neu-base)] transition-colors py-2 px-4 sm:px-6 lg:px-8 border-b border-[var(--neu-dark)]/30">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
        {/* Left: Neumorphic Brand Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl chip text-[var(--neu-accent)] flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[var(--neu-heading)]">
            StudySpark
          </span>
        </div>

        {/* Right: Neumorphic Controls */}
        <div className="flex items-center gap-3">
          {/* Saved Sets Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="button flex items-center gap-2 text-xs"
            title="My saved study sets"
            aria-label={`My saved study sets (${savedCount} saved)`}
          >
            <BookOpen className="w-4 h-4 text-[var(--neu-accent)]" />
            <span className="hidden sm:inline">My Sets</span>
            {savedCount > 0 && (
              <span className="w-5 h-5 rounded-full chip--pink text-[10px] font-bold inline-flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="button p-3 rounded-full flex items-center justify-center"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-[var(--neu-heading)]" />}
          </button>

          {/* User Account / Sign In */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="button flex items-center gap-2.5 text-xs"
                aria-label="User account menu"
                aria-expanded={showUserMenu}
              >
                <div className="w-7 h-7 rounded-full chip text-[11px] font-bold flex items-center justify-center">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "IM"}
                </div>
                <span className="hidden sm:inline text-[var(--neu-heading)] max-w-[110px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-3 w-64 card p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="pb-3 border-b border-[var(--neu-dark)]/50">
                    <p className="text-xs font-bold text-[var(--neu-heading)] truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-[var(--neu-text)] truncate">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" /> Email Verified
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSignOut();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left pt-3 text-xs text-rose-600 hover:text-rose-700 flex items-center gap-2 font-semibold transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="button button--primary text-xs"
              aria-label="Sign In"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
