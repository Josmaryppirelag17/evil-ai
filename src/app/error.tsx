"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#03070b] px-6" role="alert">
      <h2 className="font-mono text-lg text-red-400">CRITICAL SYSTEM FAILURE</h2>
      <p className="max-w-md text-center font-mono text-xs text-slate-400">
        An unexpected error occurred in the terminal interface.
      </p>
      <button onClick={reset} aria-label="Reiniciar sistema" className="cursor-pointer rounded border border-cyber-cyan/40 px-4 py-2 font-mono text-xs text-cyber-cyan transition-colors hover:border-cyber-cyan hover:bg-cyber-cyan/10">
        REBOOT SYSTEM
      </button>
    </div>
  );
}
