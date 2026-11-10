"use client";

import React from "react";

export const FlashcardSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-xl mx-auto space-y-4 animate-pulse">
      <div className="flex justify-between items-center px-2">
        <div className="h-3 w-24 bg-[var(--neu-dark)]/50 rounded-md" />
        <div className="h-3 w-16 bg-[var(--neu-dark)]/50 rounded-md" />
      </div>
      <div className="progress w-full h-1.5" />
      <div className="card w-full h-72 p-8 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="h-6 w-24 bg-[var(--neu-dark)]/40 rounded-xl" />
          <div className="h-6 w-6 bg-[var(--neu-dark)]/40 rounded-full" />
        </div>
        <div className="space-y-3 my-auto max-w-sm mx-auto w-full text-center">
          <div className="h-5 bg-[var(--neu-dark)]/50 rounded-md w-full" />
          <div className="h-5 bg-[var(--neu-dark)]/40 rounded-md w-3/4 mx-auto" />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-[var(--neu-dark)]/30">
          <div className="h-3 w-28 bg-[var(--neu-dark)]/40 rounded" />
          <div className="h-3 w-16 bg-[var(--neu-dark)]/40 rounded" />
        </div>
      </div>
      <div className="flex justify-between items-center gap-3 pt-2">
        <div className="button h-10 w-24 rounded-full" />
        <div className="button h-10 w-36 rounded-full" />
        <div className="button h-10 w-24 rounded-full" />
      </div>
    </div>
  );
};

export const BentoBlocksSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      <div className="md:col-span-2 h-44 card p-6 space-y-3">
        <div className="h-4 w-32 bg-[var(--neu-dark)]/50 rounded-md" />
        <div className="h-4 w-full bg-[var(--neu-dark)]/40 rounded-md" />
        <div className="h-4 w-5/6 bg-[var(--neu-dark)]/40 rounded-md" />
      </div>
      <div className="h-44 card p-6 space-y-3">
        <div className="h-4 w-28 bg-[var(--neu-dark)]/50 rounded-md" />
        <div className="space-y-2.5 pt-2">
          <div className="progress w-full" />
          <div className="progress w-full" />
          <div className="progress w-full" />
        </div>
      </div>
    </div>
  );
};

