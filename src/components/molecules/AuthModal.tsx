"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/utils/utils";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import Link from "next/link";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "signin" | "signup";

interface FieldErrors {
  name?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface PasswordCheck {
  label: string;
  key: string;
  test: (pw: string) => boolean;
}

const PASSWORD_CHECKS: PasswordCheck[] = [
  { label: "passwordReqLength", key: "length", test: (pw) => pw.length >= 8 },
  { label: "passwordReqUppercase", key: "upper", test: (pw) => /[A-Z]/.test(pw) },
  { label: "passwordReqNumber", key: "number", test: (pw) => /\d/.test(pw) },
  { label: "passwordReqSpecial", key: "special", test: (pw) => /[^a-zA-Z0-9]/.test(pw) },
];

function allPasswordChecksPass(pw: string): boolean {
  return PASSWORD_CHECKS.every((c) => c.test(pw));
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const { t: ctx, locale, setLocale } = useTranslation();
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const a = ctx.auth;

  const resetForm = useCallback(() => {
    setEmail("");
    setUsername("");
    setName("");
    setLastName("");
    setPassword("");
    setConfirmPassword("");
    setServerError(null);
    setFieldErrors({});
    setSubmitting(false);
  }, []);

  useFocusTrap(modalRef, onClose, open);

  useEffect(() => {
    if (!open) return;
    resetForm();
    setTimeout(() => firstInputRef.current?.focus(), 50);
  }, [open, resetForm]);

  function validateSignup(): FieldErrors {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = a.nameRequired;
    if (!lastName.trim()) errors.lastName = a.lastNameRequired;
    if (!username.trim() || username.length < 3) errors.username = a.usernameRequired;
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) errors.username = a.usernameInvalid;
    if (!email.trim()) errors.email = a.emailInvalid;
    if (!allPasswordChecksPass(password)) errors.password = "Requisitos de contraseña no cumplidos";
    if (password !== confirmPassword) errors.confirmPassword = a.confirmPasswordMismatch;
    return errors;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    if (tab === "signup") {
      const fe = validateSignup();
      if (Object.keys(fe).length > 0) {
        setFieldErrors(fe);
        return;
      }
    }

    setSubmitting(true);

    try {
      let result: { success: boolean; error?: string };

      if (tab === "signin") {
        result = await login(email, password);
      } else {
        result = await register(email, username, name, lastName, password);
      }

      if (result.success) {
        resetForm();
        onClose();
      } else {
        setServerError(result.error ?? a.serverError);
      }
    } catch {
      setServerError(a.unexpectedError);
    } finally {
      setSubmitting(false);
    }
  };

  const switchTab = (newTab: Tab) => {
    setTab(newTab);
    resetForm();
  };

  const toggleLang = () => {
    setLocale(locale === "es" ? "en" : "es");
  };

  const allPass = allPasswordChecksPass(password);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={tab === "signin" ? a.signIn : a.signUp}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg border border-cyber-cyan/40 bg-[#03070b]/95 rounded shadow-[0_0_30px_rgba(0,255,65,0.1)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-cyber-cyan/25 bg-[#060e15]">
          <div className="flex gap-2">
            <button
              onClick={() => switchTab("signin")}
              className={cn(
                "font-mono text-xs px-4 py-1.5 border transition-all cursor-pointer",
                tab === "signin"
                  ? "border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10"
                  : "border-transparent text-gray-500 hover:text-gray-300",
              )}
              aria-pressed={tab === "signin"}
            >
              {a.signIn}
            </button>
            <button
              onClick={() => switchTab("signup")}
              className={cn(
                "font-mono text-xs px-4 py-1.5 border transition-all cursor-pointer",
                tab === "signup"
                  ? "border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10"
                  : "border-transparent text-gray-500 hover:text-gray-300",
              )}
              aria-pressed={tab === "signup"}
            >
              {a.signUp}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="font-mono text-[10px] text-cyber-cyan/50 hover:text-cyber-cyan border border-cyber-cyan/20 hover:border-cyber-cyan/50 px-2 py-1 transition-all cursor-pointer"
              aria-label={a.languageToggle}
            >
              {locale === "es" ? "EN" : "ES"}
            </button>
            <button
              onClick={onClose}
              className="text-cyber-cyan/60 hover:text-cyber-cyan text-xs border border-cyber-cyan/20 hover:border-cyber-cyan/50 px-2 py-1 transition-all cursor-pointer"
              autoFocus
              aria-label={a.closeLabel}
            >
              [X]
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name + Last Name row */}
          {tab === "signup" && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="auth-name" className="font-mono text-[11px] text-cyber-cyan/70 block mb-1.5">
                  {a.name}
                </label>
                <input
                  ref={firstInputRef}
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={a.namePlaceholder}
                  maxLength={100}
                  required
                  className={cn(
                    "w-full bg-[#04090e] border text-white font-mono text-[13px] px-3 py-2.5 rounded-sm outline-none placeholder:text-gray-600",
                    fieldErrors.name ? "border-red-500" : "border-cyber-cyan/20 focus:border-cyber-cyan/50",
                  )}
                />
                {fieldErrors.name && (
                  <p className="font-mono text-[10px] text-red-400 mt-1">{fieldErrors.name}</p>
                )}
              </div>
              <div className="flex-1">
                <label htmlFor="auth-lastname" className="font-mono text-[11px] text-cyber-cyan/70 block mb-1.5">
                  {a.lastName}
                </label>
                <input
                  id="auth-lastname"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={a.lastNamePlaceholder}
                  maxLength={100}
                  required
                  className={cn(
                    "w-full bg-[#04090e] border text-white font-mono text-[13px] px-3 py-2.5 rounded-sm outline-none placeholder:text-gray-600",
                    fieldErrors.lastName ? "border-red-500" : "border-cyber-cyan/20 focus:border-cyber-cyan/50",
                  )}
                />
                {fieldErrors.lastName && (
                  <p className="font-mono text-[10px] text-red-400 mt-1">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>
          )}

          {/* Username */}
          {tab === "signup" && (
            <div>
              <label htmlFor="auth-username" className="font-mono text-[11px] text-cyber-cyan/70 block mb-1.5">
                {a.username}
              </label>
              <input
                id="auth-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={a.usernamePlaceholder}
                maxLength={50}
                required
                className={cn(
                  "w-full bg-[#04090e] border text-white font-mono text-[13px] px-3 py-2.5 rounded-sm outline-none placeholder:text-gray-600",
                  fieldErrors.username ? "border-red-500" : "border-cyber-cyan/20 focus:border-cyber-cyan/50",
                )}
              />
              {fieldErrors.username && (
                <p className="font-mono text-[10px] text-red-400 mt-1">{fieldErrors.username}</p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="auth-email" className="font-mono text-[11px] text-cyber-cyan/70 block mb-1.5">
              {a.email}
            </label>
            <input
              ref={tab === "signin" ? firstInputRef : undefined}
              id="auth-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={a.emailPlaceholder}
              maxLength={255}
              required
              className={cn(
                "w-full bg-[#04090e] border text-white font-mono text-[13px] px-3 py-2.5 rounded-sm outline-none placeholder:text-gray-600",
                fieldErrors.email ? "border-red-500" : "border-cyber-cyan/20 focus:border-cyber-cyan/50",
              )}
            />
            {fieldErrors.email && (
              <p className="font-mono text-[10px] text-red-400 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="auth-password" className="font-mono text-[11px] text-cyber-cyan/70 block mb-1.5">
              {a.password}
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === "signup" ? a.passwordPlaceholder : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
              minLength={tab === "signup" ? 8 : 1}
              maxLength={128}
              required
              className={cn(
                "w-full bg-[#04090e] border text-white font-mono text-[13px] px-3 py-2.5 rounded-sm outline-none placeholder:text-gray-600",
                fieldErrors.password ? "border-red-500" : "border-cyber-cyan/20 focus:border-cyber-cyan/50",
              )}
            />
            {fieldErrors.password && (
              <p className="font-mono text-[10px] text-red-400 mt-1">{fieldErrors.password}</p>
            )}

            {/* Dynamic password requirements checklist */}
            {tab === "signup" && password.length > 0 && (
              <div className="mt-3 border border-cyber-cyan/15 bg-cyber-cyan/5 p-3 rounded space-y-1.5">
                <p className="font-mono text-[9px] text-cyber-cyan/60 uppercase tracking-wider mb-1.5">REQUISITOS:</p>
                {PASSWORD_CHECKS.map((check) => {
                  const passed = check.test(password);
                  return (
                    <div key={check.key} className="flex items-center gap-2">
                      <span className={cn("font-mono text-[10px]", passed ? "text-cyber-green" : "text-gray-500")}>
                        {passed ? "[✓]" : "[ ]"}
                      </span>
                      <span className={cn("font-mono text-[10px]", passed ? "text-cyber-green" : "text-gray-400")}>
                        {a[check.label as keyof typeof a] as string}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Forgot password link (signin only) */}
            {tab === "signin" && (
              <div className="mt-2 text-right">
                <Link
                  href="/auth/forgot-password"
                  className="font-mono text-[10px] text-cyber-cyan/50 hover:text-cyber-cyan underline underline-offset-2 transition-colors"
                >
                  {a.forgotPassword}
                </Link>
              </div>
            )}
          </div>

          {/* Confirm Password (signup only) */}
          {tab === "signup" && (
            <div>
              <label htmlFor="auth-confirm-password" className="font-mono text-[11px] text-cyber-cyan/70 block mb-1.5">
                {a.confirmPassword}
              </label>
              <input
                id="auth-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={a.confirmPasswordPlaceholder}
                maxLength={128}
                required
                className={cn(
                  "w-full bg-[#04090e] border text-white font-mono text-[13px] px-3 py-2.5 rounded-sm outline-none placeholder:text-gray-600",
                  fieldErrors.confirmPassword ? "border-red-500" : "border-cyber-cyan/20 focus:border-cyber-cyan/50",
                )}
              />
              {fieldErrors.confirmPassword && (
                <p className="font-mono text-[10px] text-red-400 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Server error */}
          {serverError && (
            <p className="font-mono text-[11px] text-red-400" role="alert">
              ! {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || (tab === "signup" && password.length > 0 && !allPass)}
            className="w-full font-mono text-xs tracking-wider uppercase px-3 py-3 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            {submitting
              ? a.processing
              : `>>> ${tab === "signin" ? a.signIn : a.signUp}`}
          </button>

          {tab === "signup" && (
            <p className="font-mono text-[9px] text-gray-600 text-center">
              {a.privacyNotice}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cyber-cyan/10 bg-black/30 text-[9px] text-gray-600 font-mono text-center">
          <span className="text-cyber-cyan/30">[</span>
          <span> {a.authFooter} </span>
          <span className="text-cyber-cyan/30">]</span>
        </div>
      </div>
    </div>
  );
}
