"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PROJECT_GROUPS, getProject } from "@/lib/projects";
import { NATIONAL_REGION, getMetro, getState, regionFor } from "@/lib/data";
import { decodePlan, encodePlan, usePlan, type Plan, type PlanItem, type When } from "@/lib/planner";
import { formatUSD, roundMoney } from "@/lib/format";
import { track } from "@/lib/track";

const WHEN: { key: When; label: string; months: number; hint: string }[] = [
  { key: "now", label: "Now", months: 0, hint: "Urgent or already quoted" },
  { key: "year", label: "Within a year", months: 12, hint: "Save monthly toward these" },
  { key: "later", label: "In 1 to 3 years", months: 36, hint: "Watch and budget" },
];

function priced(item: PlanItem) {
  const p = getProject(item.slug);
  if (!p) return null;
  const st = item.stateCode ? getState(item.stateCode) : undefined;
  const region = st ? regionFor(st, item.metroSlug ? getMetro(st.slug, item.metroSlug) : undefined) : NATIONAL_REGION;
  const inputs = { ...p.defaults(region), ...item.inputs };
  const est = p.compute(inputs, region);
  const variant = p.variants.find((v) => v.value === String(inputs[p.variantKey]));
  const qs = new URLSearchParams(Object.entries(item.inputs).map(([k, v]) => [k, String(v)]));
  if (item.zip) qs.set("zip", item.zip);
  const href = `/${p.slug}${st && !item.zip ? `/${st.slug}${item.metroSlug ? `/${item.metroSlug}` : ""}` : ""}?${qs.toString()}`;
  return { p, est, region, variant, href };
}

export default function Planner() {
  const [stored, setStored, ready] = usePlan();
  const [shared, setShared] = useState<Plan | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const m = window.location.hash.match(/plan=([^&]+)/);
    if (m) setShared(decodePlan(decodeURIComponent(m[1])));
  }, []);

  const plan = shared ?? stored;
  const set = (p: Plan) => (shared ? setShared(p) : setStored(p));
  const rows = useMemo(() => plan.items.map((it) => ({ it, x: priced(it) })).filter((r) => r.x), [plan.items]);

  const sum = (list: typeof rows, k: "low" | "typical" | "high") => list.reduce((a, r) => a + r.x!.est[k], 0);
  const total = { low: sum(rows, "low"), typical: sum(rows, "typical"), high: sum(rows, "high") };
  const reserve = total.typical * plan.contingency;
  const monthly = WHEN.filter((w) => w.months).reduce((a, w) => a + sum(rows.filter((r) => r.it.when === w.key), "typical") * (1 + plan.contingency) / w.months, 0);

  const update = (id: string, patch: Partial<PlanItem>) => set({ ...plan, items: plan.items.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const remove = (id: string) => { set({ ...plan, items: plan.items.filter((x) => x.id !== id) }); track("plan_remove", {}); };

  if (!ready) return <div className="h-64" />;

  if (rows.length === 0) {
    return (
      <div className="border border-ink bg-paper p-6 sm:p-8">
        <p className="label">Your plan is empty</p>
        <h2 className="mt-2 font-display text-2xl font-bold">Price a job, then press &ldquo;Add to my plan&rdquo;</h2>
        <p className="mt-2 max-w-2xl text-ink-2">Each saved estimate keeps your inputs and ZIP. Add as many as you like and this page adds them up into one budget, with a reserve for surprises and a monthly savings target. Nothing leaves this browser.</p>
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          {PROJECT_GROUPS.map((g) => (
            <div key={g.key}>
              <p className="label">{g.label}</p>
              <ul className="mt-2 border-t border-ink text-[15px]">
                {g.projects.map((p) => <li key={p.slug} className="border-b border-line"><Link href={`/${p.slug}`} className="block py-2 hover:text-accent-700 hover:underline">{p.name}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {shared && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-l-4 border-blue bg-blue-50 p-4 text-[15px]">
          <span>You are looking at a plan someone shared with you. Prices are worked out fresh with today&apos;s data.</span>
          <span className="flex gap-4">
            <button onClick={() => { setStored(shared); setShared(null); history.replaceState(null, "", "/planner"); track("plan_import", {}); }} className="font-semibold text-ink underline underline-offset-4">Save it to this browser</button>
            <button onClick={() => { setShared(null); history.replaceState(null, "", "/planner"); }} className="text-ink-2 underline underline-offset-4">Show my own plan</button>
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="min-w-0 border border-ink bg-paper">
          {WHEN.map((w) => {
            const list = rows.filter((r) => r.it.when === w.key);
            if (!list.length) return null;
            return (
              <section key={w.key} className="border-b border-ink last:border-b-0">
                <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3 sm:px-6">
                  <h2 className="font-display text-xl font-bold">{w.label} <span className="ml-1 font-sans text-sm font-normal text-mute">{w.hint}</span></h2>
                  <span className="font-mono text-sm tnum">{formatUSD(roundMoney(sum(list, "typical")))}</span>
                </div>
                <ol>
                  {list.map(({ it, x }) => {
                    const n = rows.findIndex((r) => r.it.id === it.id) + 1;
                    return (
                      <li key={it.id} className="grid grid-cols-[2rem_1fr] gap-x-2 border-b border-line px-4 py-4 last:border-b-0 sm:grid-cols-[2.25rem_1fr_auto] sm:px-6">
                        <span className="font-mono text-sm text-accent-600">{String(n).padStart(2, "0")}</span>
                        <div className="min-w-0">
                          <Link href={x!.href} className="font-semibold hover:underline hover:underline-offset-4">{x!.variant?.label ?? x!.p.name}</Link>
                          <p className="text-[13px] text-mute">{x!.p.name} · {x!.region.label}{it.zip ? ` ${it.zip}` : ""} · range {formatUSD(roundMoney(x!.est.low))}–{formatUSD(roundMoney(x!.est.high))}</p>
                          <input aria-label="Note" placeholder="Add a note (quote received, contractor name...)" value={it.note ?? ""} onChange={(e) => update(it.id, { note: e.target.value })}
                            className="mt-2 w-full border-b border-dashed border-line-2 bg-transparent py-1 text-[14px] outline-none focus:border-ink" />
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
                            <label className="flex items-center gap-1.5 text-ink-2">When
                              <select value={it.when} onChange={(e) => update(it.id, { when: e.target.value as When })} className="border border-line-2 bg-white px-1.5 py-0.5">
                                {WHEN.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                              </select>
                            </label>
                            <Link href={x!.href} className="text-ink-2 underline underline-offset-4 hover:text-ink">Edit inputs</Link>
                            <button onClick={() => remove(it.id)} className="text-ink-2 underline underline-offset-4 hover:text-bad">Remove</button>
                          </div>
                        </div>
                        <span className="col-start-2 mt-2 font-mono text-lg font-semibold tnum sm:col-start-3 sm:mt-0 sm:text-right">{formatUSD(roundMoney(x!.est.typical))}</span>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>

        <aside className="border border-ink bg-paper p-5 lg:sticky lg:top-20">
          <p className="label">Budget</p>
          <ul className="mt-3 text-[15px]">
            <li className="leader py-1"><span className="text-ink-2">{rows.length} {rows.length === 1 ? "project" : "projects"}, typical</span><span className="font-mono tnum">{formatUSD(roundMoney(total.typical))}</span></li>
            <li className="leader py-1">
              <span className="text-ink-2">Reserve for surprises{" "}
                <select aria-label="Reserve" value={plan.contingency} onChange={(e) => set({ ...plan, contingency: Number(e.target.value) })} className="border border-line-2 bg-white px-1 py-0.5 text-[13px]">
                  {[0, 0.1, 0.15, 0.2].map((c) => <option key={c} value={c}>{Math.round(c * 100)}%</option>)}
                </select>
              </span>
              <span className="font-mono tnum">{formatUSD(roundMoney(reserve))}</span>
            </li>
          </ul>
          <div className="mt-2 border-y-[3px] border-double border-ink py-2">
            <div className="flex items-baseline justify-between"><span className="font-semibold">Plan for</span><span className="font-display text-3xl font-bold text-accent-600 tnum">{formatUSD(roundMoney(total.typical + reserve))}</span></div>
          </div>
          <p className="mt-2 font-mono text-[13px] text-ink-2 tnum">Fair range {formatUSD(roundMoney(total.low))} to {formatUSD(roundMoney(total.high))}</p>
          {monthly > 0 && <p className="mt-4 text-[15px] text-ink-2">To pay cash for the later jobs, set aside about <strong className="text-ink tnum">{formatUSD(roundMoney(monthly))} a month</strong>.</p>}
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-4 text-[14px] print:hidden">
            <button onClick={() => window.print()} className="font-semibold underline underline-offset-4">Print</button>
            <button onClick={async () => {
              const url = `${window.location.origin}/planner#plan=${encodeURIComponent(encodePlan(plan))}`;
              try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
              track("plan_share", { n: rows.length });
            }} className="font-semibold underline underline-offset-4">{copied ? "Link copied" : "Copy a link to share"}</button>
            {!shared && <button onClick={() => { if (confirm("Remove every project from your plan?")) set({ ...plan, items: [] }); }} className="text-ink-2 underline underline-offset-4 hover:text-bad">Clear</button>}
          </div>
          <p className="mt-3 text-xs text-mute">Saved in this browser only. Prices are recalculated each time with our latest data, so they can move when we update.</p>
        </aside>
      </div>
    </div>
  );
}
