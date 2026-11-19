import { DATA_IS_ESTIMATE } from "@/lib/data";
import type { Project } from "@/lib/engine";
import { formatUSD } from "@/lib/format";
import { PRICE_CHECK, sourcesFor } from "@/lib/sources";

const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

/**
 * "Why is our number higher than Angi's?" Shown under the estimate where the gap is big enough that a
 * reader who has just seen another site will doubt us. Bars put the published averages next to ours.
 */
export function PriceCheck({ p, ours }: { p: Project; ours: number }) {
  const c = PRICE_CHECK[p.key];
  if (!c) return null;
  const rows = [
    ...c.others.map((o) => ({ ...o, kind: "other" as const })),
    { name: "RedoPrice, typical US job", figure: ours, url: undefined, note: undefined, kind: "ours" as const },
    { ...c.anchor, note: undefined, kind: "anchor" as const },
  ];
  const max = Math.max(...rows.map((r) => r.figure)) * 1.05;
  const lowest = Math.min(...c.others.map((o) => o.figure));
  const highest = Math.max(...c.others.map((o) => o.figure));
  if (ours <= highest) return null;
  return (
    <section aria-labelledby="pc-h" className="rounded-md border border-line-2 bg-white p-5 sm:p-6">
      <h3 id="pc-h" className="font-display text-[1.35rem] font-bold leading-tight tracking-tight">Why our {p.noun} price is higher than Angi&apos;s</h3>
      <p className="mt-2 max-w-[68ch] text-[15px] text-ink-2">
        The cost pages that rank for this search put the average {p.noun} at {formatUSD(lowest)} to {formatUSD(highest)}. Our typical US job is {formatUSD(ours)}. Here is why, with the numbers side by side.
      </p>
      <ul className="mt-4 space-y-2.5">
        {rows.map((r) => (
          <li key={r.name} className="grid grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)_4.75rem] items-center gap-x-3 text-[14px] sm:grid-cols-[13rem_minmax(0,1fr)_5rem]">
            <span className={`min-w-0 leading-snug ${r.kind === "other" ? "text-ink-2" : "font-semibold text-ink"}`}>
              {r.url ? <a href={r.url} rel="nofollow noopener" target="_blank" className="underline decoration-line-2 underline-offset-2 hover:decoration-current">{r.name}</a> : r.name}
              {r.note && <span className="text-mute"> ({r.note})</span>}
            </span>
            <span className="relative h-3" aria-hidden>
              <span className={`absolute inset-y-0 left-0 rounded-sm ${r.kind === "ours" ? "bg-ink" : r.kind === "anchor" ? "bg-accent-500/80" : "bg-ink/20"}`} style={{ width: `${(r.figure / max) * 100}%` }} />
            </span>
            <span className={`text-right tnum ${r.kind === "other" ? "text-ink-2" : "font-semibold"}`}>{formatUSD(r.figure)}</span>
          </li>
        ))}
      </ul>
      <ol className="mt-5 space-y-2 text-[15px] leading-relaxed text-ink-2">
        {c.reasons.map((r, i) => <li key={i} className="grid grid-cols-[1.5rem_1fr]"><span className="font-semibold text-ink tnum">{i + 1}.</span><span>{r}</span></li>)}
      </ol>
      <p className="mt-4 text-[13px] text-mute">Headline averages as published on each page, checked {fmt(c.checked)}. Their figures may describe a different job than ours.</p>
    </section>
  );
}

/** Numbered list of the public sources behind a calculator, with what each one is used for. */
export function SourcesList({ p }: { p: Project }) {
  const list = sourcesFor(p);
  return (
    <div>
      {DATA_IS_ESTIMATE && (
        <p className="mb-4 max-w-[68ch] text-[15px] text-ink-2">
          Our prices come from a cost model of materials, labor and permits. We set and check it against these public sources, and we are importing their latest releases now. Until then, treat every figure as a modeled estimate.
        </p>
      )}
      <ol className="border-t border-line">
        {list.map((s, i) => (
          <li key={s.url + s.name} className="grid grid-cols-[2rem_1fr] gap-2 border-b border-line py-4">
            <span className="pt-0.5 text-[15px] font-semibold text-mute tnum">{i + 1}.</span>
            <div className="min-w-0">
              <p className="text-[16px] font-semibold leading-snug">
                <a href={s.url} rel="noopener" target="_blank" className="underline decoration-line-2 underline-offset-4 hover:decoration-current">{s.name}</a>
              </p>
              <p className="text-[14px] text-mute">{s.publisher} · checked {fmt(s.checked)}</p>
              <p className="mt-1 text-[15px] text-ink-2">{s.use}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
