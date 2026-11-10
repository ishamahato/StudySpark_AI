"use client";

import React from "react";

export const CleanBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
      {/* Subtle Educational Ambient Glow in W3Schools Green */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-brand-500/5 dark:bg-brand-500/10 blur-[120px] rounded-full" />
    </div>
  );
};

