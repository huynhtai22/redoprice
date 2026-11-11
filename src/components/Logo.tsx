/** Wordmark: plain serif, one accent rule underneath. No mascot, no tick. */
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`inline-flex flex-col leading-none ${light ? "text-white" : "text-ink"}`}>
      <span className="font-display text-[1.4rem] font-bold tracking-[-0.01em]">RedoPrice</span>
      <span aria-hidden className="mt-1 h-[3px] w-7 bg-accent-500" />
    </span>
  );
}
