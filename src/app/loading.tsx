export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#03070b]" role="status" aria-live="polite" aria-label="Cargando">
      <div className="flex flex-col items-center gap-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyber-cyan border-t-transparent" aria-hidden="true" />
        <p className="font-mono text-[10px] text-cyber-cyan/60">INITIALIZING...</p>
      </div>
    </div>
  );
}
