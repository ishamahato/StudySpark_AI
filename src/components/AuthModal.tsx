"use client";

import React, { useState } from "react";
import { X, Mail, Lock, User, CheckCircle2, AlertCircle, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { AuthUser, validateEmail, validatePassword } from "@/lib/authValidation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"credentials" | "verify">("credentials");

  // Validation States
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong">("weak");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!val.trim()) {
      setEmailError(null);
      setEmailSuggestion(null);
      return;
    }
    const result = validateEmail(val);
    if (!result.isValid) {
      setEmailError(result.error || null);
      setEmailSuggestion(null);
    } else {
      setEmailError(null);
      setEmailSuggestion(result.suggestion || null);
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (!val) {
      setPasswordError(null);
      return;
    }
    const result = validatePassword(val);
    setPasswordStrength(result.strength);
    setPasswordError(result.error || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setEmailError(emailCheck.error || "Invalid email");
      return;
    }

    const passCheck = validatePassword(password);
    if (!passCheck.isValid) {
      setPasswordError(passCheck.error || "Password too short");
      return;
    }

    // Move to 2-step verification simulation
    setStep("verify");
    setStatusMessage(`A 6-digit confirmation code was sent to ${email}. (Use simulated code 123456)`);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim() !== "123456" && verificationCode.trim().length !== 6) {
      setStatusMessage("Invalid code. Please enter 123456 to verify.");
      return;
    }

    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: name.trim() || email.split("@")[0],
      email: email.trim().toLowerCase(),
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("studyspark_auth_user", JSON.stringify(newUser));
    } catch {}

    onSuccess(newUser);
    onClose();
  };

  // Quick Developer One-Click Login Preset (Isha Mahato)
  const handleDeveloperLogin = () => {
    const ishaUser: AuthUser = {
      id: "usr_developer_isha",
      name: "Isha Mahato",
      email: "isha.mahato@studyspark.ai",
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("studyspark_auth_user", JSON.stringify(ishaUser));
    } catch {}
    onSuccess(ishaUser);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="card max-w-md w-full p-6 sm:p-7 space-y-5 [box-shadow:-15px_-15px_40px_var(--neu-light),15px_15px_40px_var(--neu-dark)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--neu-dark)]/40">
          <div>
            <h3 className="font-bold text-base text-neu-heading">
              {step === "verify"
                ? "Verify Email Address"
                : mode === "signin"
                ? "Sign in to StudySpark"
                : "Create StudySpark Account"}
            </h3>
            <p className="text-xs text-neu-text">
              {step === "verify"
                ? "Enter confirmation code"
                : "Sync your decks, quiz mastery, and history"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="button p-2 rounded-full min-h-0 min-w-0 text-neu-heading"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Developer One-Click Access Card */}
        <div className="inset p-4 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="chip w-8 h-8 rounded-full font-bold text-xs">
              IM
            </span>
            <div>
              <p className="text-xs font-bold text-neu-heading">
                Isha Mahato (Developer)
              </p>
              <p className="text-[10px] text-neu-text">isha.mahato@studyspark.ai</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDeveloperLogin}
            className="button button--primary px-3.5 py-1.5 rounded-full text-[11px] font-bold min-h-0 min-w-0"
          >
            One-Click Login
          </button>
        </div>

        {step === "credentials" ? (
          <>
            {/* Mode Switcher */}
            <div className="inset p-1 rounded-full grid grid-cols-2 text-xs">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`py-1.5 rounded-full font-bold min-h-0 min-w-0 transition-all ${
                  mode === "signin"
                    ? "button text-neu-accent shadow-[-2px_-2px_6px_var(--neu-light),2px_2px_6px_var(--neu-dark)]"
                    : "text-neu-text hover:text-neu-heading"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`py-1.5 rounded-full font-bold min-h-0 min-w-0 transition-all ${
                  mode === "signup"
                    ? "button text-neu-accent shadow-[-2px_-2px_6px_var(--neu-light),2px_2px_6px_var(--neu-dark)]"
                    : "text-neu-text hover:text-neu-heading"
                }`}
              >
                Register
              </button>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
              {mode === "signup" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neu-heading flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neu-accent" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Isha Mahato"
                    className="inset w-full px-4 py-2.5 rounded-full text-xs text-neu-heading focus:outline-none"
                  />
                </div>
              )}

              {/* Email Input with Real-time Validation */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neu-heading flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neu-accent" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="name@university.edu"
                  className={`inset w-full px-4 py-2.5 rounded-full text-xs text-neu-heading focus:outline-none ${
                    emailError ? "[box-shadow:inset_-3px_-3px_8px_var(--neu-light),inset_3px_3px_8px_rgba(228,93,104,0.3)]" : ""
                  }`}
                />
                {/* Validation Feedback */}
                {emailError && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {emailError}
                  </p>
                )}
                {emailSuggestion && (
                  <p className="text-[11px] text-neu-accent flex items-center gap-1 mt-1">
                    <span>Did you mean </span>
                    <button
                      type="button"
                      onClick={() => handleEmailChange(emailSuggestion)}
                      className="font-bold underline hover:opacity-80"
                    >
                      {emailSuggestion}
                    </button>
                    ?
                  </p>
                )}
              </div>

              {/* Password Input with Strength Meter */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neu-heading flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-neu-accent" /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••••"
                  className="inset w-full px-4 py-2.5 rounded-full text-xs text-neu-heading focus:outline-none"
                />
                {password && (
                  <div className="flex items-center gap-2 pt-1.5">
                    <div className="progress flex-1 h-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength === "strong"
                            ? "w-full bg-emerald-500"
                            : passwordStrength === "medium"
                            ? "w-2/3 bg-amber-500"
                            : "w-1/3 bg-red-500"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] capitalize text-neu-text font-semibold">
                      {passwordStrength}
                    </span>
                  </div>
                )}
                {passwordError && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {passwordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="button button--primary w-full py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 mt-3"
              >
                Continue with Email Verification
                <ArrowRight className="w-3.5 h-3.5 text-neu-accent" />
              </button>
            </form>
          </>
        ) : (
          /* Step 2: Verification Code Form */
          <form onSubmit={handleVerifyCode} className="space-y-4 pt-1">
            <div className="inset p-3.5 rounded-2xl text-xs text-neu-text">
              {statusMessage}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neu-heading">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                className="inset w-full px-4 py-3 rounded-full text-center font-mono tracking-widest text-base text-neu-heading focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="button flex-1 py-2.5 rounded-full text-xs font-semibold text-neu-heading min-h-0 min-w-0"
              >
                Back
              </button>
              <button
                type="submit"
                className="button button--primary flex-1 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-2 min-h-0 min-w-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-neu-accent" />
                Verify & Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

