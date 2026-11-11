"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PROJECTS, getProject, DIY } from "@/lib/projects";
import { getMetro, getState, NATIONAL_REGION, regionFor, stateFromZip, type Region } from "@/lib/data";
import type { Estimate, Input, Inputs, Project } from "@/lib/engine";
import { formatNum, formatUSD, formatUSD2, pct, roundMoney } from "@/lib/format";
import { track } from "@/lib/track";
import AnimatedNumber from "./AnimatedNumber";
import Swatch from "./Swatch";
import Icon from "./Icons";

type Props = {
  projectSlug: string;
  stateCode?: string;
  metroSlug?: string;
  preset?: Inputs;
  mode?: "full" | "quote";
  projectSwitcher?: boolean;
  /** Smaller hero version for the home page */
  compact?: boolean;
};

const BAR_COLORS = ["bg-navy", "bg-accent-500", "bg-[#7aa5d2]", "bg-[#f3b48c]", "bg-mute/50"];

export function verdictFor(q: number, e: Estimate) {
  if (q < e.low * 0.9) return { tone: "warn", title: "Unusually low", body: "Lower than our low estimate. Check what is left out (tear-off, permits, materials grade) before you sign." } as const;
  if (q <= e.typical * 1.1) return { tone: "good", title: "Looks fair", body: "Your quote is in the typical range for this job in your area." } as const;
  if (q <= e.high) return { tone: "good", title: "Fair, upper end", body: "Within the normal range, toward the top. Worth asking what you get for the extra." } as const;
  if (q <= e.high * 1.15) return { tone: "warn", title: "On the high side", body: "Above our high estimate. Ask for an itemized quote and get one or two more to compare." } as const;
  return { tone: "bad", title: "Well above typical", body: "Much higher than we would expect. Ask for line-item pricing and compare at least two more quotes." } as const;
}

export default function Calculator({ projectSlug, stateCode, metroSlug, preset, mode = "full", projectSwitcher = false, compact = false }: Props) {
  const [slug, setSlug] = useState(projectSlug);
  const p = getProject(slug) as Project;

  const initialRegion = useMemo<Region>(() => {
    const st = stateCode ? getState(stateCode) : undefined;
    if (!st) return NATIONAL_REGION;
    return regionFor(st, metroSlug ? getMetro(st.slug, metroSlug) : undefined);
  }, [stateCode, metroSlug]);

  const [region, setRegion] = useState<Region>(initialRegion);
  const [zip, setZip] = useState("");
  const [zipError, setZipError] = useState("");
  const [inputs, setInputs] = useState<Inputs>(() => ({ ...p.defaults(initialRegion), ...preset }));
  const [quoteStr, setQuoteStr] = useState("");
  const [showQuote, setShowQuote] = useState(mode === "quote");
  const [diy, setDiy] = useState(false);
  const started = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const [stickyBar, setStickyBar] = useState(false);

  // Read shared-link params once on mount (?zip=..&material=..&q=..)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const next: Inputs = {};
    for (const inp of p.inputs(region)) {
      const v = sp.get(inp.key);
      if (v !== null) next[inp.key] = inp.type === "slider" ? Number(v) : v;
    }
    if (Object.keys(next).length) setInputs((cur) => ({ ...cur, ...next }));
    const z = sp.get("zip");
    if (z) applyZip(z);
    const q = sp.get("q");
    if (q) { setQuoteStr(q); setShowQuote(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mobile sticky estimate bar when the result card is off-screen
  useEffect(() => {
    if (!resultRef.current || compact) return;
    const io = new IntersectionObserver(([e]) => setStickyBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(resultRef.current);
    return () => io.disconnect();
  }, [compact]);

  function applyZip(z: string) {
    setZip(z);
    if (z.length < 5) { setZipError(""); return; }
    const st = stateFromZip(z);
    if (!st) { setZipError("We couldn't match that ZIP. Try another."); return; }
    setZipError("");
    const r = regionFor(st, initialRegion.metro?.state === st.code ? initialRegion.metro : undefined);
    setRegion(r);
    track("calc_zip", { project: p.key, state: st.code });
  }

  function set(key: string, value: string | number) {
    if (!started.current) { started.current = true; track("calc_start", { project: p.key }); }
    setInputs((cur) => ({ ...cur, [key]: value }));
  }

  function switchProject(s: string) {
    const np = getProject(s)!;
    setSlug(s);
    setInputs(np.defaults(region));
    track("calc_switch_project", { to: np.key });
  }

  const est = useMemo(() => p.compute(inputs, region), [p, inputs, region]);
  const avg = useMemo(() => p.compute(p.defaults(region), region), [p, region]);
  const delta = est.typical / avg.typical - 1;
  const quote = Number(quoteStr.replace(/[^0-9.]/g, "")) || 0;
  const verdict = quote > 0 ? verdictFor(quote, est) : null;

  // Keep a shareable URL in the address bar
  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams();
      if (zip.length === 5) sp.set("zip", zip);
      for (const [k, v] of Object.entries(inputs)) sp.set(k, String(v));
      if (quote) sp.set("q", String(quote));
      window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
    }, 400);
    return () => clearTimeout(t);
  }, [inputs, zip, quote]);

  useEffect(() => { if (verdict) track("quote_check", { project: p.key, verdict: verdict.title }); }, [verdict?.title, p.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const alternatives = p.key === "solar" ? [] : p.variants
    .filter((v) => v.value !== inputs[p.variantKey])
    .map((v) => ({ v, t: p.compute({ ...inputs, [p.variantKey]: v.value }, region) }))
    .sort((a, b) => a.t.typical - b.t.typical);

  const diyCfg = DIY[p.key];
  const laborLine = est.breakdown.find((l) => /labor/i.test(l.label));
  const diyUnits = Number(inputs.length ?? inputs.count ?? 0);

  // Bar scale
  const lo = Math.min(est.low, avg.typical, quote || Infinity) * 0.85;
  const hi = Math.max(est.high, avg.typical, quote || 0) * 1.08;
  const pos = (n: number) => `${((n - lo) / (hi - lo)) * 100}%`;

  const inputList = p.inputs(region);

  return (
    <div id="calculator" data-ad-exclusion-zone className="relative">
      {projectSwitcher && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Project">
          {PROJECTS.map((pp) => (
            <button key={pp.slug} role="tab" aria-selected={pp.slug === slug} onClick={() => switchProject(pp.slug)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${pp.slug === slug ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2 hover:border-ink/30"}`}>
              <Icon name={pp.icon} className="h-4 w-4" />{pp.name}
            </button>
          ))}
        </div>
      )}

      <div className={`grid grid-cols-1 gap-5 ${compact ? "lg:grid-cols-[1fr_380px]" : "lg:grid-cols-[minmax(0,1fr)_400px]"} lg:items-start`}>
        {/* INPUTS (no ads may be placed in or beside this block) */}
        <div className="card min-w-0 p-4 sm:p-6">
          {mode === "quote" && (
            <div className="mb-5 rounded-2xl bg-accent-50 p-4">
              <label htmlFor="quote-amount" className="text-sm font-bold text-ink">The quote you got</label>
              <div className="mt-2 flex items-center rounded-xl border border-accent-100 bg-white px-3 focus-within:ring-2 focus-within:ring-accent-100">
                <span className="text-lg font-semibold text-mute">$</span>
                <input id="quote-amount" inputMode="numeric" placeholder="15,000" value={quoteStr}
                  onChange={(e) => setQuoteStr(e.target.value)} className="w-full bg-transparent px-2 py-3 text-lg font-semibold outline-none" />
              </div>
              <p className="mt-2 text-xs text-ink-2">Then describe the job below so we compare like with like.</p>
            </div>
          )}

          <ZipField zip={zip} onZip={applyZip} error={zipError} region={region} />

          <div className="mt-5 grid gap-6">
            {inputList.map((inp) => (
              <Field key={inp.key} inp={inp} value={inputs[inp.key]} onChange={(v) => set(inp.key, v)} compact={compact} />
            ))}
          </div>
        </div>

        {/* RESULT */}
        <div ref={resultRef} className="min-w-0 lg:sticky lg:top-20">
          <div className="card overflow-hidden" aria-live="polite">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink-2">Your estimate · {region.label}</p>
                <span className="rounded-full bg-canvas px-2 py-0.5 text-[11px] font-semibold text-mute">Est.</span>
              </div>
              <p className="mt-1 font-display text-[2.6rem] font-extrabold leading-none tracking-tight text-accent-600 sm:text-5xl">
                <AnimatedNumber value={roundMoney(est.typical)} />
              </p>
              <p className="mt-2 text-sm text-ink-2 tnum">
                Typical range {formatUSD(roundMoney(est.low))} to {formatUSD(roundMoney(est.high))}
                {est.perUnit && <> · {est.perUnit.value < 50 ? formatUSD2(est.perUnit.value) : formatUSD(est.perUnit.value)} per {est.perUnit.unit}</>}
              </p>

              {/* Range bar: low/high band, your estimate, local average, your quote */}
              <div className="relative mt-6 h-12" aria-hidden>
                <div className="absolute inset-x-0 top-5 h-2.5 rounded-full bg-canvas" />
                <div className="absolute top-5 h-2.5 rounded-full bg-gradient-to-r from-good/50 via-accent-100 to-bad/40" style={{ left: pos(est.low), width: `calc(${pos(est.high)} - ${pos(est.low)})` }} />
                <Marker at={pos(avg.typical)} label={region.state.code === "US" ? "US avg" : "Local avg"} cls="bg-navy" below />
                <Marker at={pos(est.typical)} label="You" cls="bg-accent-500" />
                {quote > 0 && <Marker at={pos(quote)} label="Quote" cls={verdict?.tone === "good" ? "bg-good" : verdict?.tone === "warn" ? "bg-warn" : "bg-bad"} below />}
              </div>

              <div className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm ${Math.abs(delta) < 0.03 ? "bg-canvas text-ink-2" : delta > 0 ? "bg-warn-50 text-warn" : "bg-good-50 text-good"}`}>
                <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {Math.abs(delta) < 0.03 ? "About the same as" : <><strong className="tnum">{pct(delta)}</strong> {delta > 0 ? "above" : "below"}</>}{" "}
                  the typical {p.noun} job in {region.label} ({formatUSD(roundMoney(avg.typical))}).
                </span>
              </div>

              {/* Quote check */}
              {mode === "full" && !showQuote && (
                <button onClick={() => { setShowQuote(true); track("quote_check_open", { project: p.key }); }} className="mt-3 flex w-full items-center justify-between rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-ink hover:border-ink/30">
                  <span className="flex items-center gap-2"><Icon name="quote" className="h-4 w-4 text-accent-600" />Got a quote? Check if it&apos;s fair</span>
                  <Icon name="arrow" className="h-4 w-4" />
                </button>
              )}
              {mode === "full" && showQuote && (
                <div className="mt-3 rounded-xl border border-line p-3">
                  <label htmlFor={`q-${p.key}`} className="text-sm font-semibold">Quote amount</label>
                  <div className="mt-1.5 flex items-center rounded-lg border border-line px-2.5">
                    <span className="text-mute">$</span>
                    <input id={`q-${p.key}`} inputMode="numeric" autoFocus placeholder="15,000" value={quoteStr} onChange={(e) => setQuoteStr(e.target.value)} className="w-full bg-transparent px-2 py-2 font-semibold outline-none" />
                  </div>
                </div>
              )}
              {verdict && (
                <div className={`mt-3 rounded-xl p-3 text-sm animate-rise ${verdict.tone === "good" ? "bg-good-50" : verdict.tone === "warn" ? "bg-warn-50" : "bg-bad-50"}`}>
                  <p className={`font-bold ${verdict.tone === "good" ? "text-good" : verdict.tone === "warn" ? "text-warn" : "text-bad"}`}>{verdict.title}: {pct(quote / est.typical - 1)} vs our estimate</p>
                  <p className="mt-0.5 text-ink-2">{verdict.body}</p>
                </div>
              )}

              {/* Breakdown */}
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-mute">Where the money goes</p>
                <div className="mt-2 flex h-3 overflow-hidden rounded-full">
                  {est.breakdown.map((l, i) => <div key={l.label} className={BAR_COLORS[i]} style={{ width: `${(l.value / est.typical) * 100}%` }} />)}
                </div>
                <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {est.breakdown.map((l, i) => (
                    <li key={l.label} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-ink-2"><span className={`h-2 w-2 rounded-full ${BAR_COLORS[i]}`} />{l.label}</span>
                      <span className="font-semibold tnum">{formatUSD(roundMoney(l.value))}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {!compact && (
                <dl className="mt-5 grid grid-cols-2 gap-2">
                  {est.metrics.map((m) => (
                    <div key={m.label} className="rounded-xl bg-canvas p-2.5">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-mute">{m.label}</dt>
                      <dd className="mt-0.5 font-bold tnum">{m.value}</dd>
                      {m.hint && <dd className="text-[11px] text-mute">{m.hint}</dd>}
                    </div>
                  ))}
                </dl>
              )}

              {/* DIY vs hire */}
              {!compact && diyCfg && laborLine && (
                <div className="mt-4 rounded-xl border border-line p-3">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-sm font-semibold"><Icon name="tools" className="h-4 w-4" />Do it yourself?</p>
                    <div className="flex rounded-full bg-canvas p-0.5 text-xs font-semibold">
                      {["Hire a pro", "DIY"].map((t, i) => (
                        <button key={t} onClick={() => { setDiy(i === 1); track("diy_toggle", { project: p.key, diy: i === 1 }); }} className={`rounded-full px-2.5 py-1 ${diy === (i === 1) ? "bg-white shadow-sm" : "text-mute"}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  {diy && (
                    <div className="mt-2 text-sm text-ink-2 animate-rise">
                      <p>Skip about <strong className="text-good tnum">{formatUSD(roundMoney(laborLine.value - (diyCfg.tools[0] + diyCfg.tools[1]) / 2))}</strong> of labor after {formatUSD(diyCfg.tools[0])} to {formatUSD(diyCfg.tools[1])} in tools and rentals.</p>
                      <p className="mt-1">Time: about {formatNum(Math.max(1, Math.ceil(diyUnits / diyCfg.unitsPerDay)))} days for two people. {diyCfg.difficulty}.</p>
                      <p className="mt-1 text-xs text-mute">{diyCfg.warning}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Swap material: compare & play */}
              {!compact && alternatives.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-mute">Swap {p.variantNoun}</p>
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {alternatives.slice(0, 6).map(({ v, t }) => {
                      const d = t.typical - est.typical;
                      return (
                        <button key={v.value} onClick={() => { set(p.variantKey, v.value); track("compare_click", { project: p.key, to: v.value }); }}
                          className="shrink-0 rounded-xl border border-line px-3 py-2 text-left text-xs hover:border-ink/30">
                          <span className="block font-semibold text-ink">{v.label}</span>
                          <span className={`tnum font-bold ${d > 0 ? "text-warn" : "text-good"}`}>{d > 0 ? "+" : "−"}{formatUSD(Math.abs(roundMoney(d)))}</span>
                          {t.lifespanYears && <span className="text-mute"> · {t.lifespanYears} yr</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line bg-canvas/60 px-5 py-3 text-sm sm:px-6">
              {compact ? (
                <Link href={`/${p.slug}`} className="inline-flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2 font-semibold text-white hover:bg-accent-600" onClick={() => track("related_click", { from: "home-hero", to: p.slug })}>
                  Full {p.noun} breakdown <Icon name="arrow" className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <ShareButton project={p.key} />
                  <a href="#quote-form" onClick={() => track("lead_open", { project: p.key, from: "result" })} className="font-semibold text-ink-2 underline-offset-4 hover:underline">
                    Compare with local {p.quoteNoun}
                  </a>
                </>
              )}
            </div>
          </div>
          {!compact && <p className="mt-2 px-1 text-[11px] leading-relaxed text-mute">Estimates use RedoPrice&apos;s cost model with regional adjustments. They are not quotes. <Link href="/how-we-calculate" className="underline">How we calculate</Link></p>}
        </div>
      </div>

      {/* Mobile sticky estimate bar */}
      {stickyBar && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}>
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-mute">{p.name} · {region.state.code}</p>
              <p className="font-display text-xl font-extrabold text-accent-600 tnum">{formatUSD(roundMoney(est.typical))}</p>
            </div>
            <button onClick={() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">See breakdown</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Marker({ at, label, cls, below = false }: { at: string; label: string; cls: string; below?: boolean }) {
  return (
    <div className="absolute top-0 -translate-x-1/2 transition-[left] duration-300" style={{ left: at }}>
      {!below && <span className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap text-[10px] font-bold text-ink">{label}</span>}
      <span className={`mt-[14px] block h-5 w-1.5 rounded-full ring-2 ring-white ${cls}`} />
      {below && <span className="absolute left-1/2 top-[38px] -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-mute">{label}</span>}
    </div>
  );
}

function ZipField({ zip, onZip, error, region }: { zip: string; onZip: (z: string) => void; error: string; region: Region }) {
  return (
    <div>
      <label htmlFor="zip" className="text-sm font-bold text-ink">ZIP code</label>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="flex flex-1 items-center rounded-xl border border-line bg-white px-3 focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-100">
          <Icon name="pin" className="h-4 w-4 text-mute" />
          <input id="zip" inputMode="numeric" autoComplete="postal-code" maxLength={5} placeholder="e.g. 75201" value={zip}
            onChange={(e) => onZip(e.target.value.replace(/\D/g, "").slice(0, 5))} className="w-full bg-transparent px-2 py-2.5 text-base outline-none" />
        </div>
        <span className="hidden shrink-0 rounded-full bg-canvas px-3 py-1.5 text-xs font-semibold text-ink-2 sm:block">Pricing: {region.label}</span>
      </div>
      {error ? <p className="mt-1 text-xs text-bad">{error}</p> : <p className="mt-1 text-xs text-mute sm:hidden">Pricing: {region.label}</p>}
    </div>
  );
}

function Field({ inp, value, onChange, compact }: { inp: Input; value: string | number; onChange: (v: string | number) => void; compact?: boolean }) {
  const id = `f-${inp.key}`;
  if (inp.type === "slider") {
    return (
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor={id} className="text-sm font-bold">{inp.label}</label>
          <span className="font-display text-lg font-bold tnum">{inp.prefix}{formatNum(Number(value))} <span className="text-sm font-medium text-mute">{inp.unit}</span></span>
        </div>
        {inp.help && <p className="text-xs text-mute">{inp.help}</p>}
        <input id={id} type="range" min={inp.min} max={inp.max} step={inp.step} value={Number(value)} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full" />
      </div>
    );
  }
  if (inp.type === "select") {
    return (
      <div>
        <label htmlFor={id} className="text-sm font-bold">{inp.label}</label>
        <select id={id} value={String(value)} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base">
          {inp.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }
  if (inp.type === "cards") {
    const opts = compact ? inp.options.slice(0, 4) : inp.options;
    return (
      <fieldset>
        <legend className="text-sm font-bold">{inp.label}</legend>
        <div className={`mt-2 grid grid-cols-2 gap-2 ${opts.length > 4 ? "sm:grid-cols-4" : opts.length > 2 ? "sm:grid-cols-4" : ""}`} role="radiogroup">
          {opts.map((o) => {
            const on = String(value) === o.value;
            return (
              <button type="button" role="radio" aria-checked={on} key={o.value} onClick={() => onChange(o.value)}
                className={`overflow-hidden rounded-xl border text-left transition ${on ? "border-accent-500 ring-2 ring-accent-100" : "border-line hover:border-ink/25"}`}>
                <Swatch name={o.swatch} className="block h-12 w-full" />
                <span className="block px-2.5 pb-2 pt-1.5">
                  <span className="block text-[13px] font-semibold leading-tight">{o.label}</span>
                  {o.tag && <span className={`mt-0.5 inline-block text-[10px] font-bold uppercase tracking-wide ${o.tag === "Budget" ? "text-good" : o.tag === "Premium" ? "text-navy" : "text-accent-700"}`}>{o.tag}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  }
  return (
    <fieldset>
      <legend className="text-sm font-bold">{inp.label}</legend>
      <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup">
        {inp.options.map((o) => {
          const on = String(value) === o.value;
          return (
            <button type="button" role="radio" aria-checked={on} key={o.value} onClick={() => onChange(o.value)} title={o.hint}
              className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2 hover:border-ink/30"}`}>
              {o.label}
            </button>
          );
        })}
      </div>
      {(() => { const h = inp.options.find((o) => String(value) === o.value)?.hint; return h ? <p className="mt-1 text-xs text-mute">{h}</p> : null; })()}
    </fieldset>
  );
}

function ShareButton({ project }: { project: string }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={async () => {
      try { await navigator.clipboard.writeText(window.location.href); setDone(true); setTimeout(() => setDone(false), 2000); } catch { /* ignore */ }
      track("share_link", { project });
    }} className="inline-flex items-center gap-1.5 font-semibold text-ink">
      <Icon name={done ? "check" : "link"} className="h-4 w-4" />{done ? "Link copied" : "Copy link to this estimate"}
    </button>
  );
}
