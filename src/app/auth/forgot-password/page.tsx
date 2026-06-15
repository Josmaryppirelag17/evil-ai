"use client";

import { useState, useRef } from "react";
import { useTranslation } from "@/lib/i18n";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const a = t.auth;
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const honeyRef = useRef("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setResetUrl(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, _honey: honeyRef.current }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(a.resetLinkSent);
        setResetUrl(data.resetUrl);
      } else {
        setError(data.error ?? a.unknownError);
      }
    } catch {
      setError(a.networkError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03070b] flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-cyber-cyan/40 bg-[#03070b]/95 rounded shadow-[0_0_30px_rgba(0,240,255,0.1)]">
        <div className="flex items-center justify-between px-6 py-3 border-b border-cyber-cyan/25 bg-[#060e15]">
          <h1 className="font-mono text-xs text-cyber-cyan uppercase tracking-widest font-bold">
            {a.resetPasswordTitle ?? "RESTABLECER CONTRASEÑA"}
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
          {!message && (
            <>
              <p className="font-mono text-[11px] text-gray-400 leading-relaxed">
                {a.resetInstructions}
              </p>
              <div>
                <label htmlFor="reset-email" className="font-mono text-[10px] text-cyber-cyan/70 block mb-1.5">
                  {a.email}
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={a.emailPlaceholder}
                  required
                  className="w-full bg-[#04090e] border border-cyber-cyan/20 text-white font-mono text-xs px-3 py-2.5 rounded-sm outline-none focus:border-cyber-cyan/50 placeholder:text-gray-600"
                />
              </div>
            </>
          )}

          {message && (
            <div className="space-y-4">
              <div className="border border-cyber-green/30 bg-cyber-green/5 p-4 rounded">
                <p className="font-mono text-xs text-cyber-green">{message}</p>
              </div>
              {resetUrl && process.env.NODE_ENV === "development" && (
                <div className="border border-cyber-cyan/20 bg-cyber-cyan/5 p-3 rounded">
                  <p className="font-mono text-[9px] text-gray-500 mb-1">[DEV] Enlace de restauración:</p>
                  <a
                    href={resetUrl}
                    className="font-mono text-[10px] text-cyber-cyan underline break-all hover:text-cyber-cyan/80"
                  >
                    {resetUrl}
                  </a>
                </div>
              )}
              <Link
                href="/"
                className="block w-full text-center font-mono text-[11px] tracking-wider uppercase px-3 py-2.5 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 transition-all"
              >
                {a.goHome}
              </Link>
            </div>
          )}

          {error && (
            <p className="font-mono text-[10px] text-red-400" role="alert">
              ! {error}
            </p>
          )}

          {!message && (
            <button
              type="submit"
              disabled={submitting}
              className="w-full font-mono text-[11px] tracking-wider uppercase px-3 py-2.5 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              {submitting ? a.processing : a.sendLinkCta}
            </button>
          )}
        </form>

        <div className="px-6 py-3 border-t border-cyber-cyan/10 bg-black/30 text-[8px] text-gray-600 font-mono text-center">
          <Link href="/" className="text-cyber-cyan/60 hover:text-cyber-cyan underline underline-offset-2">
            {a.goHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
