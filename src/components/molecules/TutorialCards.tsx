"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslation } from "@/lib/i18n";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const STORAGE_KEY = "vil-tutorial-done";

function useTutorialDone() {
  const [done, setDone] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== "true") {
      setDone(false);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDone(true);
  };

  return { done, dismiss };
}

export function TutorialCards() {
  const { t } = useTranslation();
  const { done, dismiss } = useTutorialDone();
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, dismiss, !done);

  if (done) return null;

  const cards = [
    { title: t.tutorial.card1Title, desc: t.tutorial.card1Desc },
    { title: t.tutorial.card2Title, desc: t.tutorial.card2Desc },
    { title: t.tutorial.card3Title, desc: t.tutorial.card3Desc },
    { title: t.tutorial.card4Title, desc: t.tutorial.card4Desc },
  ];

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.tutorial.title}
    >
      <div className="w-full max-w-2xl">
        <h2 className="text-center text-cyber-cyan text-xl font-bold mb-6 tracking-widest">
          {t.tutorial.title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {cards.map((card, i) => (
            <article
              key={i}
              className="border border-cyber-border bg-cyber-card/90 rounded p-4 hover:border-cyber-cyan/50 transition-colors"
            >
              <h3 className="text-cyber-cyan text-sm font-bold mb-2 tracking-wider">
                {`0${i + 1}. ${card.title}`}
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed">
                {card.desc}
              </p>
            </article>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={dismiss}
            className="px-8 py-3 border border-cyber-cyan text-cyber-cyan font-bold tracking-widest text-sm hover:bg-cyber-cyan/10 transition-colors focus-visible:outline-2 focus-visible:outline-cyber-cyan"
            autoFocus
          >
            {t.tutorial.dismiss}
          </button>
        </div>
      </div>
    </div>
  );
}
