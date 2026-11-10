"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[StudySpark Uncaught Boundary Error]:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.removeItem("studyspark_saved_sets");
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--neu-base)] flex items-center justify-center p-6 text-neu-text">
          <div className="max-w-md w-full card p-6 sm:p-8 space-y-5 text-center">
            <div className="chip chip--pink w-14 h-14 rounded-3xl mx-auto flex items-center justify-center">
              <AlertOctagon className="w-7 h-7 text-red-500" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-neu-heading">
              Something went wrong
            </h2>

            <p className="text-xs sm:text-sm text-neu-text leading-relaxed">
              An unexpected display issue occurred. Your study data has been preserved and protected from data loss.
            </p>

            {this.state.error && (
              <details className="text-left text-xs text-neu-text inset rounded-2xl p-4">
                <summary className="cursor-pointer font-bold text-neu-heading hover:text-neu-accent transition-colors">
                  Technical Diagnostics
                </summary>
                <pre className="mt-2 text-[11px] font-mono whitespace-pre-wrap break-all text-red-500">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="button px-5 py-2.5 rounded-full font-bold text-xs text-neu-heading min-h-0 min-w-0"
              >
                Attempt Recovery
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="button button--primary px-5 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 min-h-0 min-w-0"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
