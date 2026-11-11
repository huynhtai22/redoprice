import Link from "next/link";
import { STATUS_LABEL, datasetsFor, type DatasetMeta } from "@/lib/data";
import { longDate } from "@/lib/format";

const tone: Record<DatasetMeta["status"], string> = {
  verified: "border-good text-good",
  sourced: "border-accent-600 text-accent-600",
  partial: "border-accent-100 text-accent-700",
  model: "border-ink-2 text-ink-2",
  estimate: "border-warn text-warn",
};

const PURPOSE: Record<string, string> = {
  "national-costs": "National installed price per unit, split into materials and labor",
  "regional-index": "How labor and material prices in your state compare with the US",
  "metro-index": "Labor prices in your metro area (city pages)",
  "labor-wages": "Hourly wages for roofers, carpenters, electricians, HVAC techs and other trades",
  "energy-and-solar": "Electricity prices and solar output by state",
  "housing-defaults": "Typical home size, used only to pre-fill the calculator",
  "material-spot-checks": "Shelf prices for common materials, checked by hand",
};

/** Full list of datasets behind a calculator, with status, period and a link to each public source. */
export default function SourcesLedger({ projectKey, place }: { projectKey?: string; place?: string }) {
  const sets = datasetsFor(projectKey);
  return (
    <section id="sources" className="scroll-mt-20">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="label">Sources</p>
          <h2 className="mt-1 font-display text-[1.75rem] font-bold tracking-tight">Where these numbers come from</h2>
        </div>
        <Link href="/how-we-calculate" className="link text-sm">Read the full method</Link>
      </div>
      <p className="mt-2 max-w-3xl text-[15px] text-ink-2">
        Every figure on this page{place ? ` for ${place}` : ""} is computed from the datasets below. Each one carries a release number and a status, so you can see
        what comes straight from public data and what is still our own model.
      </p>
      <ol className="mt-4 border-t border-ink">
        {sets.map((d, i) => (
          <li key={d.dataset} className="grid gap-x-4 gap-y-1 border-b border-line py-3 sm:grid-cols-[2rem_minmax(0,1fr)_auto]">
            <span className="hidden text-sm font-semibold text-mute tnum sm:block">{String(i + 1).padStart(2, "0")}</span>
            <div className="min-w-0">
              <p className="font-semibold">{PURPOSE[d.dataset] ?? d.dataset}</p>
              <ul className="mt-1 space-y-0.5 text-[14px] text-ink-2">
                {!!d.refs?.length && d.sources.filter((s) => /pending|RedoPrice|modeled|by hand/i.test(s)).map((s) => <li key={s} className="italic text-mute">{s}</li>)}
                {(d.refs?.length ? d.refs : []).map((r) => (
                  <li key={r.url + r.label}>
                    <a href={r.url} target="_blank" rel="noopener" className="link">{r.publisher}</a>, {r.label}
                    {r.period && <span className="text-mute"> · {r.period}</span>}
                  </li>
                ))}
                {!d.refs?.length && d.sources.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
              <span className={`rounded-sm border px-1.5 py-0.5 font-semibold text-[10.5px] uppercase tracking-wider ${tone[d.status]}`}>{STATUS_LABEL[d.status]}</span>
              <span className="font-mono text-[11px] text-mute tnum">rel. {d.version} · {longDate(d.updated)}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
