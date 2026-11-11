/** Wordmark: serif "RedoPrice" with a pencil-red tick, like a figure checked off on an estimate. */
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className={`font-display text-[1.45rem] font-bold tracking-tight ${light ? "text-paper" : "text-ink"}`}>RedoPrice</span>
      <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden className="translate-y-[1px]">
        <path d="M1.5 7.5 6 12 14.5 1.5" fill="none" stroke="#b8392a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
