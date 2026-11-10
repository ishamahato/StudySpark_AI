"use client";

import React from "react";
import { AlertCircle, RotateCcw, Zap, WifiOff, Clock, ShieldAlert } from "lucide-react";
import { AIErrorDetail } from "@/types/study";

interface ErrorDisplayProps {
  error: AIErrorDetail;
  onRetry: () => void;
  onFallbackToMock?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onFallbackToMock,
}) => {
  const getDisplayDetails = () => {
    switch (error.code) {
      case "MALFORMED_JSON":
        return {
          title: "Malformed Output Received",
          description: error.message || "The AI model returned unparseable text. Please retry generation.",
          icon: AlertCircle,
        };
      case "SCHEMA_MISMATCH":
        return {
          title: "Incomplete Study Structure",
          description: error.message || "Required study components were missing from the AI output.",
          icon: AlertCircle,
        };
      case "TIMEOUT":
        return {
          title: "Request Timed Out",
          description: error.message || "The model took too long to complete. Try retrying or switching to Instant Mode.",
          icon: Clock,
        };
      case "RATE_LIMIT":
        return {
          title: "Model Rate Limit Reached",
          description: error.message || "The AI provider is experiencing high traffic. Please wait a moment or try offline mode.",
          icon: Clock,
        };
      case "AUTH_ERROR":
        return {
          title: "Authentication Issue",
          description: error.message || "AI service credentials temporarily unavailable. Please retry or continue in Instant Offline Mode.",
          icon: ShieldAlert,
        };
      case "NETWORK_ERROR":
        return {
          title: "Connection Failed",
          description: error.message || "Unable to reach the generation endpoint. Check your network connection.",
          icon: WifiOff,
        };
      case "EMPTY_RESPONSE":
        return {
          title: "Empty Output from Model",
          description: error.message || "The AI returned an empty response. Try providing more detailed notes.",
          icon: AlertCircle,
        };
      case "STALE_REQUEST_ABORTED":
        return {
          title: "Generation Cancelled",
          description: "This request was superseded by a newer action or manually cancelled.",
          icon: Clock,
        };
      default:
        return {
          title: "Generation Issue Encountered",
          description: error.message || "An issue occurred while generating your study set. Your input has been saved.",
          icon: AlertCircle,
        };
    }
  };

  const { title, description, icon: Icon } = getDisplayDetails();

  return (
    <div
      role="alert"
      className="max-w-2xl mx-auto my-6 p-6 sm:p-7 card space-y-4 transition-all animate-in fade-in duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="chip chip--pink w-10 h-10 rounded-2xl shrink-0 mt-0.5">
          <Icon className="w-5 h-5 text-red-500" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-neu-heading">
            {title}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-neu-text leading-relaxed">
            {description}
          </p>

          {error.hint && (
            <p className="mt-3 text-xs text-neu-text inset p-3.5 rounded-xl font-medium">
              💡 {error.hint}
            </p>
          )}

          {/* Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {error.canRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="button button--primary px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 min-h-0 min-w-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry Request
              </button>
            )}

            {onFallbackToMock && (
              <button
                type="button"
                onClick={onFallbackToMock}
                className="button px-5 py-2.5 rounded-full text-xs font-semibold text-neu-heading flex items-center gap-2 min-h-0 min-w-0"
              >
                <Zap className="w-3.5 h-3.5 text-neu-accent" />
                Switch to Instant Offline Mode
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
