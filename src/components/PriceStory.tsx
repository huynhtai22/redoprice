"use client";
/**
 * Two signature explainers that sit under the calculator:
 *  1. "How we got to your number": a waterfall from the typical US job to this estimate,
 *     one step per thing that changed it (your choices, local labor, local materials, other local factors).
 *  2. "What moves your price most": for every input, the cheapest and dearest choice with
 *     everything else held still. Sorted by how many dollars each one can swing.
 * Both are computed live from the same project model, so they always add up to the estimate.
 */
import { NATIONAL_REGION, type Region } from "@/lib/data";
import type { Estimate, Inputs, Project } from "@/lib/engine";
import { formatNum, formatUSD, roundMoney } from "@/lib/format";
import { track } from "@/lib/track";

type Props = { p: Project; inputs: Inputs; region: Region; est: Estimate; onSet: (key: string, value: string | number) => void };

export default function PriceStory(props: Props) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-10 lg:mt-5">
      <Waterfall {...props} />
      <Drivers {...props} />
    </div>
  );
}

function Waterfall({ p, inputs, region, est }: Props) {
  const us = NATIONAL_REGION;
  const typicalUS = p.compute(p.defaults(us), us).typical;
  const yoursUS = p.compute(inputs, us).typical;
  const withLabor = p.compute(inputs, { ...us, laborIndex: region.laborIndex }).typical;
  const withMat = p.compute(inputs, { ...us, laborIndex: region.laborIndex, materialIndex: region.materialIndex }).typical;
  const local = region.state.code !== "US";
  const where = region.metro ? region.metro.name : region.state.name;

  const steps = [
    { label: `Typical ${p.noun} job, US average`, delta: typicalUS, total: true },
    { label: "Your home and your choices", delta: yoursUS - typicalUS },
    ...(local ? [
      { label: `Labor rates in ${where}`, delta: withLabor - yoursUS },
      { label: `Material prices in ${where}`, delta: withMat - withLabor },
      { label: "Other local factors", delta: est.typical - withMat, hint: "Climate, sun hours or energy prices, where they apply" },
    ] : []),
  ].filter((s, i) => i === 0 || Math.abs(s.delta) >= Math.max(50, est.typical * 0.005));

  let run = 0;
  const rows = steps.map((s) => {
    const from = s.total ? 0 : run;
    run = s.total ? s.delta : run + s.delta;
    return { ...s, from, to: run };
  });
  const max = Math.max(est.typical, ...rows.map((r) => Math.max(r.from, r.to))) * 1.04;
  const x = (v: number) => `${(Math.max(0, v) / max) * 100}%`;

  return (
    <section aria-labelledby="ws-h" className="min-w-0">
      <h2 id="ws-h" className="font-display text-[1.6rem] font-bold leading-tight tracking-tight">How we got to your number</h2>
      <p className="mt-1 text-[15px] text-ink-2">Start from the typical US job, then add each thing that changes it for you.{!local && " Add your ZIP code to see local labor and material prices."}</p>
      <ol className="mt-4 border-t-2 border-ink">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[minmax(0,1fr)_6.5rem] items-center gap-x-3 border-b border-line py-2.5">
            <div className="min-w-0">
              <p className="text-[15px] leading-snug">{r.label}</p>
              {"hint" in r && r.hint && <p className="text-[13px] text-mute">{r.hint}</p>}
              <div className="relative mt-1.5 h-3" aria-hidden>
                <span className={`absolute inset-y-0 rounded-sm ${r.total ? "bg-ink/80" : r.delta >= 0 ? "bg-warn/70" : "bg-accent-500/80"}`}
                  style={{ left: x(Math.min(r.from, r.to)), width: `calc(${x(Math.max(r.from, r.to))} - ${x(Math.min(r.from, r.to))})`, minWidth: 2 }} />
              </div>
            </div>
            <p className={`text-right text-[15px] font-semibold tnum ${r.total ? "" : r.delta >= 0 ? "text-warn" : "text-accent-600"}`}>
              {r.total ? formatUSD(roundMoney(r.delta)) : `${r.delta >= 0 ? "+" : "−"}${formatUSD(Math.abs(roundMoney(r.delta)))}`}
            </p>
          </li>
        ))}
        <li className="grid grid-cols-[minmax(0,1fr)_6.5rem] items-center gap-x-3 py-3">
          <div>
            <p className="text-[15px] font-semibold">Your estimate</p>
            <div className="relative mt-1.5 h-3" aria-hidden><span className="absolute inset-y-0 left-0 rounded-sm bg-ink" style={{ width: x(est.typical) }} /></div>
          </div>
          <p className="text-right text-[17px] font-bold tnum">{formatUSD(roundMoney(est.typical))}</p>
        </li>
      </ol>
    </section>
  );
}

function Drivers({ p, inputs, region, est, onSet }: Props) {
  const rows = p.inputs(region).map((inp) => {
    if (inp.type === "slider") {
      const v = Number(inputs[inp.key]);
      const lo = Math.max(inp.min, Math.round((v * 0.8) / inp.step) * inp.step);
      const hi = Math.min(inp.max, Math.round((v * 1.2) / inp.step) * inp.step);
      const a = p.compute({ ...inputs, [inp.key]: lo }, region).typical;
      const b = p.compute({ ...inputs, [inp.key]: hi }, region).typical;
      return {
        key: inp.key, label: inp.label, current: `${inp.prefix ?? ""}${formatNum(v)} ${inp.unit}`,
        min: { v: Math.min(a, b), label: `${formatNum(a <= b ? lo : hi)} ${inp.unit}` },
        max: { v: Math.max(a, b), label: `${formatNum(a <= b ? hi : lo)} ${inp.unit}` },
        note: "20% smaller or larger", cheapest: null as null | { value: string; label: string; save: number },
      };
    }
    const priced = inp.options.map((o) => ({ o, v: p.compute({ ...inputs, [inp.key]: o.value }, region).typical })).sort((a, b) => a.v - b.v);
    const cur = inp.options.find((o) => o.value === String(inputs[inp.key]));
    const first = priced[0];
    return {
      key: inp.key, label: inp.label, current: cur?.label ?? String(inputs[inp.key]),
      min: { v: first.v, label: first.o.label },
      max: { v: priced[priced.length - 1].v, label: priced[priced.length - 1].o.label },
      note: "",
      // Only suggest a switch for real choices (the material or system), never for facts about the house
      cheapest: inp.key === p.variantKey && first.o.value !== String(inputs[inp.key]) && est.typical - first.v >= 100 ? { value: first.o.value, label: first.o.label, save: est.typical - first.v } : null,
    };
  }).filter((r) => r.max.v - r.min.v >= 50).sort((a, b) => (b.max.v - b.min.v) - (a.max.v - a.min.v)).slice(0, 5);

  if (!rows.length) return null;
  const lo = Math.min(...rows.map((r) => r.min.v), est.typical);
  const hi = Math.max(...rows.map((r) => r.max.v), est.typical);
  const pad = (hi - lo) * 0.04 || 1;
  const x = (v: number) => `${((v - (lo - pad)) / (hi - lo + 2 * pad)) * 100}%`;

  return (
    <section aria-labelledby="dr-h" className="min-w-0">
      <h2 id="dr-h" className="font-display text-[1.6rem] font-bold leading-tight tracking-tight">What moves your price most</h2>
      <p className="mt-1 text-[15px] text-ink-2">Each line changes one thing and holds the rest still, so you can see which answers matter. The black mark is your estimate.</p>
      <ol className="mt-4 border-t-2 border-ink">
        {rows.map((r) => (
          <li key={r.key} className="border-b border-line py-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[15px] font-semibold">{r.label}</p>
              <p className="text-[14px] text-ink-2">You picked: {r.current}</p>
            </div>
            <div className="relative mt-2 h-4" aria-hidden>
              <span className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-ink/15" style={{ left: x(r.min.v), width: `calc(${x(r.max.v)} - ${x(r.min.v)})` }} />
              <span className="absolute top-0 h-4 w-[3px] -translate-x-1/2 rounded-sm bg-ink" style={{ left: x(est.typical) }} />
            </div>
            <div className="mt-1 flex justify-between gap-3 text-[14px] tnum text-ink-2">
              <span>{formatUSD(roundMoney(r.min.v))} <span className="text-mute">{r.min.label}</span></span>
              <span className="text-right">{formatUSD(roundMoney(r.max.v))} <span className="text-mute">{r.max.label}</span></span>
            </div>
            {r.note && <p className="mt-0.5 text-[13px] text-mute">{r.note}</p>}
            {r.cheapest && (
              <button type="button" onClick={() => { onSet(r.key, r.cheapest!.value); track("driver_apply", { project: p.key, input: r.key }); }}
                className="mt-1.5 min-h-[36px] text-[14px] font-semibold text-accent-600 underline decoration-accent-500/40 underline-offset-4 hover:decoration-current">
                Try {r.cheapest.label}: saves about {formatUSD(roundMoney(r.cheapest.save))}
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
