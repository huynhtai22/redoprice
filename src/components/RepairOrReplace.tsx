"use client";
import { useState } from "react";
import Link from "next/link";
import { formatUSD } from "@/lib/format";
import { track } from "@/lib/track";

type Verdict = { call: "Repair" | "Replace" | "Get it inspected"; tone: "good" | "warn" | "bad"; why: string; cost?: string };

const ROOF_LIFE = { asphalt: 25, metal: 50, tile: 60 } as const;
const ROOF_DAMAGE = {
  isolated: { label: "A few shingles or one small leak", cost: [300, 1000] },
  area: { label: "Damage in one area (one slope)", cost: [800, 2500] },
  widespread: { label: "Curling, bald spots or leaks in several places", cost: [2500, 6000] },
  structural: { label: "Sagging, soft decking or water in the attic", cost: [0, 0] },
} as const;

function roofVerdict(age: number, mat: keyof typeof ROOF_LIFE, dmg: keyof typeof ROOF_DAMAGE): Verdict {
  const used = age / ROOF_LIFE[mat];
  const c = ROOF_DAMAGE[dmg].cost;
  if (dmg === "structural") return { call: "Get it inspected", tone: "bad", why: "Sagging or soft decking can mean structural damage. Keep water out with a tarp and get a roofer to inspect before deciding." };
  if (dmg === "widespread" || used >= 0.85) return { call: "Replace", tone: "warn", why: `The roof is about ${Math.round(used * 100)}% through its expected life${dmg === "widespread" ? " and the damage is widespread" : ""}. Repairs would buy little time.` };
  if (used >= 0.6 && dmg === "area") return { call: "Repair", tone: "warn", why: "Repair now, but the roof is past middle age. Start budgeting for a replacement in the next few years.", cost: `${formatUSD(c[0])} to ${formatUSD(c[1])}` };
  return { call: "Repair", tone: "good", why: "The roof has plenty of life left and the damage is local. A repair is the better value.", cost: `${formatUSD(c[0])} to ${formatUSD(c[1])}` };
}

const HVAC_LIFE = { ac: 15, heatpump: 15, furnace: 20 } as const;
function hvacVerdict(age: number, sys: keyof typeof HVAC_LIFE, repair: number, r22: boolean): Verdict {
  const score = age * repair;
  if (r22 && repair > 500) return { call: "Replace", tone: "warn", why: "Your system uses R-22 refrigerant, which is no longer produced. Refrigerant repairs are expensive and the system is likely near the end of its life." };
  if (score > 5000 || age >= HVAC_LIFE[sys]) return { call: "Replace", tone: "warn", why: `By the common "$5,000 rule" (age x repair cost = ${formatUSD(score)}), replacement is the better value. The system is ${age} years into a typical ${HVAC_LIFE[sys]}-year life.` };
  if (score > 3500) return { call: "Repair", tone: "warn", why: `It is close (age x repair cost = ${formatUSD(score)}). Repair if the rest of the system is healthy, but get a replacement quote too.` };
  return { call: "Repair", tone: "good", why: `Age x repair cost is ${formatUSD(score)}, well under the $5,000 threshold. Repairing is the better value.` };
}

const seg = (on: boolean) => `rounded-full border px-3.5 py-2 text-sm font-semibold ${on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2"}`;

export default function RepairOrReplace() {
  const [tab, setTab] = useState<"roof" | "hvac">("roof");
  const [age, setAge] = useState(18);
  const [mat, setMat] = useState<keyof typeof ROOF_LIFE>("asphalt");
  const [dmg, setDmg] = useState<keyof typeof ROOF_DAMAGE>("isolated");
  const [hAge, setHAge] = useState(12);
  const [sys, setSys] = useState<keyof typeof HVAC_LIFE>("ac");
  const [repair, setRepair] = useState(800);
  const [r22, setR22] = useState(false);

  const v = tab === "roof" ? roofVerdict(age, mat, dmg) : hvacVerdict(hAge, sys, repair, r22);

  return (
    <div id="calculator" data-ad-exclusion-zone className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
      <div className="card p-5 sm:p-6">
        <div className="flex gap-2" role="tablist">
          {(["roof", "hvac"] as const).map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); track("ror_tab", { tab: t }); }} className={seg(tab === t)}>{t === "roof" ? "Roof leak or damage" : "AC, heat pump or furnace"}</button>)}
        </div>
        {tab === "roof" ? (
          <div className="mt-5 grid gap-5">
            <label className="block"><span className="flex justify-between text-sm font-bold">Roof age <span className="tnum">{age} years</span></span><input type="range" min={0} max={60} value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full" /></label>
            <fieldset><legend className="text-sm font-bold">Material</legend><div className="mt-2 flex flex-wrap gap-1.5">{(Object.keys(ROOF_LIFE) as (keyof typeof ROOF_LIFE)[]).map((m) => <button key={m} onClick={() => setMat(m)} className={seg(mat === m)}>{m === "asphalt" ? "Asphalt shingles" : m === "metal" ? "Metal" : "Tile or slate"}</button>)}</div></fieldset>
            <fieldset><legend className="text-sm font-bold">What do you see?</legend><div className="mt-2 grid gap-2">{(Object.keys(ROOF_DAMAGE) as (keyof typeof ROOF_DAMAGE)[]).map((d) => <button key={d} onClick={() => setDmg(d)} className={`rounded-xl border px-3 py-2.5 text-left text-sm ${dmg === d ? "border-accent-500 bg-accent-50 font-semibold" : "border-line"}`}>{ROOF_DAMAGE[d].label}</button>)}</div></fieldset>
          </div>
        ) : (
          <div className="mt-5 grid gap-5">
            <fieldset><legend className="text-sm font-bold">System</legend><div className="mt-2 flex flex-wrap gap-1.5">{(Object.keys(HVAC_LIFE) as (keyof typeof HVAC_LIFE)[]).map((s) => <button key={s} onClick={() => setSys(s)} className={seg(sys === s)}>{s === "ac" ? "Central AC" : s === "heatpump" ? "Heat pump" : "Furnace"}</button>)}</div></fieldset>
            <label className="block"><span className="flex justify-between text-sm font-bold">System age <span className="tnum">{hAge} years</span></span><input type="range" min={0} max={30} value={hAge} onChange={(e) => setHAge(Number(e.target.value))} className="w-full" /></label>
            <label className="block"><span className="flex justify-between text-sm font-bold">Repair quote <span className="tnum">{formatUSD(repair)}</span></span><input type="range" min={100} max={5000} step={50} value={repair} onChange={(e) => setRepair(Number(e.target.value))} className="w-full" /></label>
            {sys !== "furnace" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={r22} onChange={(e) => setR22(e.target.checked)} className="h-4 w-4 accent-[#f2601d]" />It uses R-22 refrigerant (most systems installed before 2010)</label>}
          </div>
        )}
      </div>
      <div className="card p-5 sm:p-6 lg:sticky lg:top-20" aria-live="polite">
        <p className="text-sm font-semibold text-ink-2">Our call</p>
        <p className={`mt-1 font-display text-4xl font-extrabold ${v.tone === "good" ? "text-good" : v.tone === "warn" ? "text-accent-600" : "text-bad"}`}>{v.call}</p>
        <p className="mt-2 text-ink-2">{v.why}</p>
        {v.cost && <p className="mt-3 rounded-xl bg-canvas p-3 text-sm">Typical repair cost for this: <strong className="tnum">{v.cost}</strong> (estimate)</p>}
        <Link href={tab === "roof" ? "/roof-replacement-cost" : "/hvac-replacement-cost"} className="mt-4 inline-flex rounded-full bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-600">
          See what replacement would cost →
        </Link>
        <p className="mt-3 text-xs text-mute">A rule of thumb, not an inspection. If water is coming in, protect the area first and call a pro.</p>
      </div>
    </div>
  );
}
