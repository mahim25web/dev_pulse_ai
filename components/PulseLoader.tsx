export function PulseLoader({ label = "Generating" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 py-20 text-sm text-slate-400">
      <svg viewBox="0 0 120 32" className="h-8 w-32 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2 16h26l6-12 10 24 8-18 6 6h60" pathLength={1} opacity={0.2} />
        <path d="M2 16h26l6-12 10 24 8-18 6 6h60" pathLength={1} className="pulse-run" />
      </svg>
      {label}
    </div>
  );
}
