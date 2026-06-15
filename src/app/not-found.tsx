import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-[#03070b] px-6" role="alert">
      <span className="font-mono text-6xl text-red-400">404</span>
      <h1 className="font-mono text-lg text-slate-300">SYSTEM ERROR: PAGE NOT FOUND</h1>
      <p className="max-w-md text-center font-mono text-xs text-slate-500">
        The requested resource does not exist in the system.
      </p>
      <Link href="/" aria-label="Volver a la página de inicio" className="rounded border border-cyber-cyan/40 px-4 py-2 font-mono text-xs text-cyber-cyan transition-colors hover:border-cyber-cyan hover:bg-cyber-cyan/10">
        RETURN TO TERMINAL
      </Link>
    </div>
  );
}
