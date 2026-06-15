"use client";

import { useState, useRef } from "react";
import { useTranslation } from "@/lib/i18n";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const a = t.auth;
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const honeyRef = useRef("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(a.passwordMin);
      return;
    }
    if (password !== confirmPassword) {
      setError(a.confirmPasswordMismatch);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, _honey: honeyRef.current }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error ?? a.resetError);
      }
    } catch {
      setError(a.networkError);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#03070b] flex items-center justify-center p-4">
        <div className="w-full max-w-md border border-cyber-green/40 bg-[#03070b]/95 rounded shadow-[0_0_30px_rgba(0,255,65,0.15)]">
          <div className="px-6 py-5 border-b border-cyber-green/25 bg-[#060e15]">
            <h1 className="font-mono text-xs text-cyber-green uppercase tracking-widest font-bold">
              {a.passwordResetTitle}
            </h1>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div className="border border-cyber-green/30 bg-cyber-green/5 p-4 rounded">
              <p className="font-mono text-xs text-cyber-green">
                {a.passwordResetSuccessDesc}
              </p>
            </div>
            <Link
              href="/"
              className="block w-full text-center font-mono text-[11px] tracking-wider uppercase px-3 py-2.5 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 transition-all"
            >
                {a.signInCta}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03070b] flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-cyber-cyan/40 bg-[#03070b]/95 rounded shadow-[0_0_30px_rgba(0,240,255,0.1)]">
        <div className="flex items-center justify-between px-6 py-3 border-b border-cyber-cyan/25 bg-[#060e15]">
          <h1 className="font-mono text-xs text-cyber-cyan uppercase tracking-widest font-bold">
            {a.resetPasswordTitle}
          </h1>
          <Link
            href="/"
            className="font-mono text-[10px] text-cyber-cyan/60 hover:text-cyber-cyan border border-cyber-cyan/20 hover:border-cyber-cyan/50 px-2 py-0.5 transition-all"
          >
            [X]
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div aria-hidden="true" className="absolute -left-[9999px] opacity-0">
            <input tabIndex={-1} autoComplete="off" name="_honey" type="text" value={honeyRef.current} onChange={(e) => { honeyRef.current = e.target.value; }} />
          </div>
          <div>
            <label htmlFor="new-password" className="font-mono text-[10px] text-cyber-cyan/70 block mb-1.5">
              {a.newPassword}
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={a.newPasswordPlaceholder}
              minLength={8}
              maxLength={128}
              required
              className="w-full bg-[#04090e] border border-cyber-cyan/20 text-white font-mono text-xs px-3 py-2.5 rounded-sm outline-none focus:border-cyber-cyan/50 placeholder:text-gray-600"
            />
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="font-mono text-[10px] text-cyber-cyan/70 block mb-1.5">
              {a.confirmNewPassword}
            </label>
            <input
              id="confirm-new-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={a.confirmNewPasswordPlaceholder}
              maxLength={128}
              required
              className="w-full bg-[#04090e] border border-cyber-cyan/20 text-white font-mono text-xs px-3 py-2.5 rounded-sm outline-none focus:border-cyber-cyan/50 placeholder:text-gray-600"
            />
          </div>

          {error && (
            <p className="font-mono text-[10px] text-red-400" role="alert">
              ! {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full font-mono text-[11px] tracking-wider uppercase px-3 py-2.5 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            {submitting ? a.processing : a.resetCta}
          </button>
        </form>
      </div>
    </div>
  );
}
