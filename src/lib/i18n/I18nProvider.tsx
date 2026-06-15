"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import type { Locale, Translations } from "./types";
import { translations } from "./translations";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function syncLangAttr(l: Locale) {
  document.documentElement.lang = l === "en" ? "en" : "es";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");
  const announceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("vil-locale") as Locale | null;
    if (stored === "es" || stored === "en") {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    syncLangAttr(locale);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    document.documentElement.classList.toggle("reduce-motion", mq.matches);
    const handler = (e: MediaQueryListEvent) => document.documentElement.classList.toggle("reduce-motion", e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("vil-locale", l);
    syncLangAttr(l);
    if (announceRef.current) {
      announceRef.current.textContent = l === "en" ? "Language changed to English" : "Idioma cambiado a Español";
    }
  }, []);

  const value: I18nContextValue = {
    locale,
    setLocale,
    t: translations[locale],
  };

  return (
    <I18nContext.Provider value={value}>
      <div ref={announceRef} role="status" aria-live="polite" aria-atomic="true" className="sr-only" />
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}
