"use client";
import { useState } from "react";
import type { Estimate, Inputs, Project } from "@/lib/engine";
import { DIY, REPAIR, commonRepairs, diyVerdict, repairVerdict } from "@/lib/verdicts";
import { formatNum, formatUSD, roundMoney } from "@/lib/format";
import { track } from "@/lib/track";

const TONE = { good: "text-good border-good", warn: "text-warn border-warn", bad: "text-bad border-bad" } as const;

/** Two quick verdicts under every calculator: repair or replace, and DIY or hire. */
export default function Verdicts({ p, est, inputs }: { p: Project; est: Estimate; inputs: Inputs }) {
  return (
    <section aria-label="Verdicts" className="mt-5 grid overflow-hidden rounded-md border border-line-2 bg-white md:grid-cols-2">
      <RepairPanel p={p} est={est} />
      <DiyPanel p={p} est={est} inputs={inputs} />
    </section>
  );
}

function Verdict({ call, tone, children }: { call: string; tone: keyof typeof TONE; children: React.ReactNode }) {
  return (
    <div className="mt-4 animate-rise" key={call}>
      <p className={`inline-block border-y-2 py-0.5 font-display text-[1.65rem] font-bold leading-tight ${TONE[tone]}`}>{call}</p>
      <div className="mt-2 text-[15px] leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}

function RepairPanel({ p, est }: { p: Project; est: Estimate }) {
  const cfg = REPAIR[p.key];
  const life = est.lifespanYears ?? cfg.life ?? 20;
  const repairs = commonRepairs(p.key);
  const [age, setAge] = useState(() => Math.round(life * 0.6));
  const [repair, setRepair] = useState(() => (repairs[0] ? Math.round((repairs[0].cost[0] + repairs[0].cost[1]) / 2) : Math.round(est.typical * 0.1)));
  const [flag, setFlag] = useState<number | undefined>(undefined);
  const v = repairVerdict(p.key, est, age, repair, flag);
  const maxAge = Math.max(10, Math.round(life * 1.5));

  return (
    <div className="border-b border-line p-5 sm:p-6 md:border-b-0 md:border-r">
      <p className="label">{cfg.repairWord ?? "Repair"} or {(cfg.replaceWord ?? "replace").toLowerCase()}?</p>
      <div className="mt-3 grid gap-4">
        <label className="block">
          <span className="flex items-baseline justify-between text-[15px] font-semibold">How old is {cfg.item}? <span className="font-mono tnum">{age} yr</span></span>
          <input type="range" min={0} max={maxAge} value={Math.min(age, maxAge)} onChange={(e) => setAge(Number(e.target.value))} className="w-full" />
        </label>
        <div>
          <label htmlFor={`rep-${p.key}`} className="text-[15px] font-semibold">Repair quote</label>
          <div className="mt-1.5 flex items-center border border-line-2 bg-white px-2.5">
            <span className="text-mute">$</span>
            <input id={`rep-${p.key}`} inputMode="numeric" value={repair ? formatNum(repair) : ""} onChange={(e) => setRepair(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)} className="w-full bg-transparent px-2 py-2 font-mono font-semibold outline-none" />
          </div>
          {repairs.length > 0 && (
            <ul className="mt-2 text-[13px]">
              {repairs.map((r) => {
                const mid = Math.round((r.cost[0] + r.cost[1]) / 2);
                return (
                  <li key={r.label}>
                    <button type="button" onClick={() => { setRepair(mid); track("ror_pick", { project: p.key }); }} className={`leader w-full py-1 text-left ${repair === mid ? "font-semibold text-ink" : "text-ink-2 hover:text-ink"}`}>
                      <span>{r.label}</span><span className="font-mono tnum">{formatUSD(r.cost[0])}–{formatUSD(r.cost[1])}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {cfg.flags?.map((f, i) => (
          <label key={f.label} className="flex items-start gap-2 text-[14px] text-ink-2">
            <input type="checkbox" checked={flag === i} onChange={(e) => setFlag(e.target.checked ? i : undefined)} className="mt-1 h-4 w-4 accent-[var(--color-ink)]" />
            {f.label}
          </label>
        ))}
      </div>
      <Verdict call={v.call} tone={v.tone}>
        <p>{v.why}</p>
        {!(flag !== undefined) && (
          <p className="mt-2 font-mono text-[13px] tnum">
            Repair: {formatUSD(roundMoney(v.repairPerYear))}/yr over ~{v.yearsBought} yr · New: {formatUSD(roundMoney(v.replacePerYear))}/yr over {life} yr
          </p>
        )}
      </Verdict>
      <p className="mt-3 text-xs text-mute">{cfg.rule}</p>
    </div>
  );
}

function DiyPanel({ p, est, inputs }: { p: Project; est: Estimate; inputs: Inputs }) {
  const cfg = DIY[p.key];
  const v = diyVerdict(p.key, est, inputs);
  return (
    <div className="p-5 sm:p-6">
      <p className="label">Do it yourself or hire?</p>
      <ul className="mt-3 text-[15px]">
        <li className="leader py-1"><span className="text-ink-2">Labor you would skip</span><span className="font-mono tnum">{formatUSD(roundMoney(v.laborSaved))}</span></li>
        <li className="leader py-1"><span className="text-ink-2">Tools and rentals</span><span className="font-mono tnum">−{formatUSD(roundMoney(v.tools))}</span></li>
        <li className="mt-1 flex items-baseline justify-between border-t border-ink pt-2 font-semibold"><span>Net saving</span><span className={`font-mono tnum ${v.net > 0 ? "text-good" : "text-bad"}`}>{formatUSD(roundMoney(v.net))}</span></li>
        <li className="leader py-1 text-[14px]"><span className="text-ink-2">Time, two people</span><span className="font-mono tnum">about {v.days} {v.days === 1 ? "day" : "days"}</span></li>
        {v.net > 0 && <li className="leader py-1 text-[14px]"><span className="text-ink-2">What your time earns</span><span className="font-mono tnum">{formatUSD(Math.max(0, Math.round(v.perHour)))}/hr each</span></li>}
      </ul>
      <Verdict call={v.call} tone={v.tone}>
        <p>{cfg.skills}</p>
        <p className="mt-1.5 text-[14px]"><strong className="text-ink">Watch out:</strong> {cfg.risks}</p>
      </Verdict>
    </div>
  );
}
