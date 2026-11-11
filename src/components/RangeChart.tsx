import Link from "next/link";
import { formatUSD, roundMoney } from "@/lib/format";

export type RangeRow = { label: string; href?: string; low: number; typical: number; high: number; highlight?: boolean; note?: string };

/**
 * Low / typical / high range plot on a shared axis. Plain HTML, so it is responsive,
 * readable by screen readers and ships no JavaScript.
 */
export default function RangeChart({ rows, caption, axisLabel = "Installed cost" }: { rows: RangeRow[]; caption?: string; axisLabel?: string }) {
  const max = Math.max(...rows.map((r) => r.high));
  const step = niceStep(max / 4);
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const x = (v: number) => `${(v / top) * 100}%`;
  return (
    <figure>
      <div className="grid grid-cols-[minmax(6.5rem,9rem)_minmax(0,1fr)] gap-x-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <div />
        <div className="relative h-6 text-[11px] text-mute tnum" aria-hidden>
          {ticks.map((t, i) => (
            <span key={t} className={`absolute bottom-1 ${i === 0 ? "" : i === ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2"}`} style={{ left: x(t) }}>{short(t)}</span>
          ))}
        </div>
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <div className={`border-t border-line py-2.5 pr-1 text-[14.5px] leading-tight ${r.highlight ? "font-semibold" : ""}`}>
              {r.href ? <Link href={r.href} className="hover:underline">{r.label}</Link> : r.label}
              {r.note && <span className="block text-xs font-normal text-mute">{r.note}</span>}
            </div>
            <div className="relative border-t border-line">
              {ticks.map((t) => <span key={t} aria-hidden className="absolute inset-y-0 w-px bg-line/70" style={{ left: x(t) }} />)}
              <span aria-hidden className={`absolute top-1/2 h-2 -translate-y-1/2 rounded-full ${r.highlight ? "bg-accent-500/35" : "bg-ink/15"}`} style={{ left: x(r.low), width: `calc(${x(r.high)} - ${x(r.low)})` }} />
              <span aria-hidden className={`absolute top-1/2 h-4 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-sm ${r.highlight ? "bg-accent-600" : "bg-ink"}`} style={{ left: x(r.typical) }} />
              <span className="sr-only">{formatUSD(roundMoney(r.low))} to {formatUSD(roundMoney(r.high))}, typical {formatUSD(roundMoney(r.typical))}</span>
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line pt-2 text-xs text-mute">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-6 rounded-full bg-ink/15" />Low to high</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-[3px] rounded-sm bg-ink" />Typical</span>
        <span>{axisLabel}, USD</span>
        {caption && <span className="basis-full text-ink-2">{caption}</span>}
      </figcaption>
    </figure>
  );
}

function niceStep(raw: number) {
  const p = 10 ** Math.floor(Math.log10(raw));
  const n = raw / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}
const short = (v: number) => (v === 0 ? "$0" : v >= 1000 ? `$${+(v / 1000).toFixed(1)}k` : `$${v}`);
