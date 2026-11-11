import { ENERGY, NATIONAL } from "../data";
import type { Region } from "../data";
import { formatNum, formatUSD } from "../format";
import { clamp, regional, triple, type Inputs, type Project } from "../engine";

const S = NATIONAL.solar;

/** cents/kWh -> $/kWh for a region (US average fallback ~17.5c) */
export const rateFor = (r: Region) => (ENERGY.residentialCentsPerKwh[r.state.code] ?? 17.5) / 100;
export const yieldFor = (r: Region) => ENERGY.solarKwhPerKwYear[r.state.code] ?? 1350;

export function solarModel(i: Inputs, r: Region) {
  const rate = rateFor(r);
  const annualUse = (Number(i.bill) * 12) / rate;
  const perKw = yieldFor(r) * S.orientationFactor[i.orientation as keyof typeof S.orientationFactor] * S.shadingFactor[i.shading as keyof typeof S.shadingFactor];
  const kw = i.size === "auto" ? clamp(Math.round((annualUse / perKw) * 2) / 2, S.minKw, S.maxKw) : Number(i.size);
  const production = kw * perKw;
  const tier = S.materials[i.tier as keyof typeof S.materials] ?? S.materials.standard;
  const battery = i.battery === "yes";
  const rates = [tier.low, tier.typical, tier.high];
  const cost = triple((k) => regional(rates[k], tier.laborShare, r) * kw * 1000 + (battery ? S.battery[k] : 0) + S.permit[k] * r.laborIndex);
  // Savings: only self-consumed production is valued at the retail rate (conservative; export credit varies by utility)
  const year1 = Math.min(production, annualUse) * rate;
  let cum = 0, payback: number | null = null, total = 0;
  for (let y = 0; y < 25; y++) {
    const s = year1 * Math.pow(1 + S.rateEscalation, y) * Math.pow(1 - S.degradation, y);
    total += s;
    if (payback === null && cum + s >= cost[1]) payback = y + (cost[1] - cum) / s;
    cum += s;
  }
  return { rate, annualUse, perKw, kw, production, year1, payback, total, cost, tier, battery };
}

export const solar: Project = {
  key: "solar",
  slug: "solar-panel-cost",
  name: "Solar panels",
  noun: "solar system",
  calculatorName: "Solar Panel Cost & Payback Calculator",
  short: "System size, installed cost and payback years from your electric bill.",
  intro: "Start with your monthly electric bill. We size a system for your state's sunshine and power prices, then show cost, payback and 25-year savings.",
  icon: "solar",
  variantKey: "size",
  variantNoun: "system size",
  variantPlural: "system sizes",
  quoteNoun: "solar installers",
  inputs: () => [
    { key: "bill", label: "Average monthly electric bill", type: "slider", min: 40, max: 600, step: 5, unit: "/mo", prefix: "$" },
    {
      key: "size", label: "System size", type: "select",
      options: [
        { value: "auto", label: "Size it from my bill" },
        ...[4, 5, 6, 7, 8, 10, 12, 15].map((k) => ({ value: String(k), label: `${k} kW` })),
      ],
    },
    {
      key: "orientation", label: "Best roof direction", type: "segmented",
      options: [{ value: "south", label: "South" }, { value: "east-west", label: "East / West" }, { value: "flat", label: "Flat" }],
    },
    {
      key: "shading", label: "Shade on the roof", type: "segmented",
      options: [{ value: "none", label: "None" }, { value: "some", label: "Some" }, { value: "heavy", label: "A lot" }],
    },
    {
      key: "tier", label: "Panels", type: "cards",
      options: [
        { value: "standard", label: "Standard panels", hint: "Tier 1, 20%+ efficient", tag: "Mid-range", swatch: "panel" },
        { value: "premium", label: "Premium panels", hint: "Top efficiency, long warranty", tag: "Premium", swatch: "panel-premium" },
      ],
    },
    {
      key: "battery", label: "Battery backup", type: "segmented",
      options: [{ value: "no", label: "No battery" }, { value: "yes", label: "Add battery" }],
    },
  ],
  defaults: (r) => ({
    bill: Math.round((900 * rateFor(r)) / 5) * 5,
    size: "auto", orientation: "south", shading: "none", tier: "standard", battery: "no",
  }),
  compute: (i, r) => {
    const m = solarModel(i, r);
    const [low, typical, high] = m.cost;
    const panels = m.tier.typical * (1 - m.tier.laborShare) * r.materialIndex * m.kw * 1000;
    const labor = m.tier.typical * m.tier.laborShare * r.laborIndex * m.kw * 1000;
    return {
      low, typical, high,
      breakdown: [
        { label: "Panels & inverters", value: panels },
        { label: "Installation labor", value: labor },
        { label: "Battery", value: m.battery ? S.battery[1] : 0 },
        { label: "Permit & interconnection", value: S.permit[1] * r.laborIndex },
      ].filter((l) => l.value > 0),
      perUnit: { value: typical / (m.kw * 1000), unit: "watt" },
      metrics: [
        { label: "System size", value: `${formatNum(m.kw, 1)} kW`, hint: `about ${Math.round((m.kw * 1000) / 420)} panels` },
        { label: "Yearly production", value: `${formatNum(Math.round(m.production / 100) * 100)} kWh`, hint: `you use about ${formatNum(Math.round(m.annualUse / 100) * 100)} kWh` },
        { label: "First-year savings", value: formatUSD(m.year1), hint: `at ${(m.rate * 100).toFixed(1)}¢/kWh` },
        { label: "Payback", value: m.payback ? `${m.payback.toFixed(1)} years` : "Over 25 years" },
        { label: "25-year net savings", value: formatUSD(m.total - typical), hint: "after paying for the system" },
      ],
      notes: [
        S.federalCreditNote,
        "Savings assume you use the power you produce at your current rate, rising 3% a year. Export credits, state rebates and SRECs vary by utility and are not included, so your payback may be shorter.",
        m.battery ? "A battery adds backup power during outages; it usually does not shorten payback unless your utility uses time-of-use rates." : "",
      ].filter(Boolean),
      lifespanYears: m.tier.lifespanYears,
    };
  },
  variants: [4, 6, 8, 10, 12].map((k) => ({
    value: String(k),
    slug: `${k}kw-solar-system`,
    label: `${k} kW solar system`,
    blurb: `A ${k} kW system has about ${Math.round((k * 1000) / 420)} panels and typically produces ${formatNum(k * 1150)} to ${formatNum(k * 1650)} kWh a year depending on your state, enough for a home using roughly ${formatNum(Math.round((k * 1350) / 12 / 10) * 10)} kWh a month.`,
    pros: ["Price per watt drops as systems get larger", "Covers more of your bill", "Fits most suburban roofs"],
    cons: ["Bigger is not better if you export power at a low credit", "Roof space and shading limit size", "Upfront cost rises with size"],
  })),
  costFactors: [
    { title: "System size", body: "Size follows your electricity use and your state's sunshine. The same bill needs a bigger system in Seattle than in Phoenix." },
    { title: "Price per watt", body: "Installers quote in dollars per watt. Compare quotes on this number, after equipment and before incentives." },
    { title: "Federal credit ended", body: "The 30% homeowner tax credit (25D) no longer applies to systems placed in service after 2025. Leases and PPAs may still get a business credit; ask how it is passed on to you." },
    { title: "Electricity prices", body: "Payback depends mostly on what you pay for power. High-rate states such as California, Massachusetts and Hawaii pay back fastest." },
    { title: "Net metering rules", body: "How your utility credits exported power can change payback by years. California's NEM 3.0, for example, credits exports far below retail." },
  ],
  faqs: [
    { q: "How much do solar panels cost?", a: "Installed systems are usually quoted at roughly $2.50 to $4.00 per watt before incentives, so a 7 kW system often lands around $18,000 to $26,000. Use the calculator for your bill and state." },
    { q: "Is there still a federal tax credit for solar?", a: "Not for homeowners who buy a system placed in service after December 31, 2025. The residential credit under section 25D ended under the July 2025 tax law. State and utility incentives may still apply." },
    { q: "How long does solar take to pay back?", a: "Commonly 7 to 15 years without the federal credit, shorter in states with high electricity prices and good export credits." },
    { q: "Should I lease or buy?", a: "Buying gives the most savings over 25 years if you can pay cash or get a low-rate loan. Leases and PPAs need no money down but save less and can complicate selling the house." },
  ],
  relatedGuides: ["is-solar-worth-it-2026", "how-to-read-a-contractor-quote", "questions-to-ask-before-hiring-a-contractor"],
};
