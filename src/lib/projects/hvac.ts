import { HOUSING, NATIONAL } from "../data";
import { formatUSD } from "../format";
import { clamp, triple, type Project } from "../engine";
import type { Region } from "../data";

const H = NATIONAL.hvac;
type Mat = keyof typeof H.materials;

export const climateZone = (r: Region): "hot" | "mixed" | "cold" =>
  r.state.climate.includes("heat") || r.state.climate.includes("hurricane") ? "hot"
    : r.state.climate.includes("snow") ? "cold" : "mixed";

export const hvac: Project = {
  key: "hvac",
  group: "systems",
  permit: H.permit as [number, number, number],
  slug: "hvac-replacement-cost",
  name: "HVAC replacement",
  noun: "HVAC system",
  calculatorName: "HVAC & Heat Pump Replacement Cost Calculator",
  short: "Installed cost for AC, heat pumps, furnaces and mini-splits, sized to your home.",
  intro: "Pick a system type and enter your home size. We size the system for your climate and price it for your area.",
  icon: "hvac",
  variantKey: "system",
  variantNoun: "system type",
  variantPlural: "system types",
  quoteNoun: "HVAC contractors",
  inputs: () => [
    {
      key: "system", label: "System type", type: "cards",
      options: [
        { value: "heat-pump", label: "Heat pump", hint: "Heats and cools", tag: "Mid-range", swatch: "hp" },
        { value: "central-ac", label: "Central AC", hint: "Cooling only", tag: "Budget", swatch: "ac" },
        { value: "furnace-ac", label: "Furnace + AC", hint: "Full system swap", tag: "Premium", swatch: "combo" },
        { value: "gas-furnace", label: "Gas furnace", hint: "Heating only", tag: "Budget", swatch: "furnace" },
        { value: "ductless-mini-split", label: "Ductless mini-split", hint: "No ducts needed", tag: "Mid-range", swatch: "mini" },
      ],
    },
    { key: "homeSqft", label: "Home size", help: "Area the system heats or cools", type: "slider", min: 400, max: 5000, step: 50, unit: "sq ft" },
    {
      key: "efficiency", label: "Efficiency", type: "segmented",
      options: [
        { value: "standard", label: "Standard", hint: "Meets federal minimum" },
        { value: "high", label: "High", hint: "ENERGY STAR range" },
        { value: "premium", label: "Premium", hint: "Variable speed" },
      ],
    },
    {
      key: "ductwork", label: "Ductwork", type: "segmented",
      options: [
        { value: "good", label: "Good as is" },
        { value: "repair", label: "Needs repair" },
        { value: "replace", label: "Replace ducts" },
      ],
    },
  ],
  defaults: (r) => ({ system: "heat-pump", homeSqft: HOUSING.typicalHomeSqft[r.state.code] ?? 1800, efficiency: "standard", ductwork: "good" }),
  compute: (i, r) => {
    const key = (i.system as Mat) in H.materials ? (i.system as Mat) : "heat-pump";
    const m = H.materials[key];
    const sqft = Number(i.homeSqft);
    const zone = climateZone(r);
    const ductless = key === "ductless-mini-split";
    const units = ductless
      ? clamp(Math.ceil(sqft / H.sqftPerZone), 1, 8)
      : clamp(Math.round((sqft / H.sqftPerTon[zone]) * 2) / 2, 1.5, 5);
    const ef = H.efficiencyFactor[i.efficiency as keyof typeof H.efficiencyFactor] ?? 1;
    const duct = ductless || i.ductwork === "good" ? [0, 0, 0]
      : i.ductwork === "repair" ? H.ductwork.repair
      : H.ductwork["replace-per-sqft"].map((x) => x * sqft);
    const rates = [m.low, m.typical, m.high];
    const [low, typical, high] = triple((k) =>
      (rates[k] * (1 - m.laborShare) * ef * r.materialIndex + rates[k] * m.laborShare * r.laborIndex) * units +
      duct[k] * r.laborIndex + H.permit[k] * r.laborIndex,
    );
    return {
      low, typical, high,
      breakdown: [
        { label: "Equipment", value: m.typical * (1 - m.laborShare) * ef * r.materialIndex * units },
        { label: "Installation labor", value: m.typical * m.laborShare * r.laborIndex * units },
        { label: "Ductwork", value: duct[1] * r.laborIndex },
        { label: "Permit & inspection", value: H.permit[1] * r.laborIndex },
      ].filter((l) => l.value > 0),
      perUnit: { value: typical / units, unit: ductless ? "zone" : "ton" },
      metrics: [
        { label: ductless ? "Indoor zones" : "Estimated size", value: ductless ? `${units} zones` : `${units} tons`, hint: ductless ? "about 1 head per 600 sq ft" : `${zone} climate sizing rule of thumb` },
        { label: "Expected lifespan", value: `${m.lifespanYears} years` },
        { label: "Cost per year of life", value: formatUSD(typical / m.lifespanYears) },
      ],
      notes: [
        "Sizing here is a rule of thumb. A proper Manual J load calculation can change the size by half a ton or more; ask installers to do one.",
        "Utility rebates and state heat pump programs can cut the price. They are not included here.",
      ],
      lifespanYears: m.lifespanYears,
    };
  },
  variants: [
    { value: "heat-pump", slug: "heat-pump", label: "Heat pump", blurb: "An air-source heat pump moves heat in or out of the home with one outdoor unit. Modern cold-climate models heat well below freezing.", pros: ["Heats and cools with one system", "Lower running cost than electric resistance or propane", "Utility rebates are common"], cons: ["Higher upfront cost than AC alone", "May need backup heat in very cold areas", "Install quality matters a lot"] },
    { value: "central-ac", slug: "central-ac", label: "Central air conditioner", blurb: "A split-system AC with an outdoor condenser and indoor coil, using existing ducts.", pros: ["Lowest cost for whole-home cooling", "Uses existing ducts", "Widely serviced"], cons: ["Cooling only", "Usually paired with a separate furnace", "Refrigerant transition can raise prices"] },
    { value: "furnace-ac", slug: "furnace-and-ac", label: "Furnace and AC", blurb: "Replacing the furnace and AC together, so the matched system carries full warranties and efficiency ratings.", pros: ["Matched components", "One installation", "Often discounted versus two separate jobs"], cons: ["Highest total cost", "May replace a unit with life left", "Gas line work in some homes"] },
    { value: "gas-furnace", slug: "gas-furnace", label: "Gas furnace", blurb: "A natural gas furnace heating through ducts. Still the most common heating system in cold states.", pros: ["Strong heat in cold weather", "Long life", "Low running cost where gas is cheap"], cons: ["Heating only", "Needs venting and gas service", "Carbon monoxide safety checks"] },
    { value: "ductless-mini-split", slug: "ductless-mini-split", label: "Ductless mini-split", blurb: "Wall-mounted indoor heads connected to an outdoor heat pump, with no ducts.", pros: ["No ductwork needed", "Room-by-room control", "Very efficient"], cons: ["Indoor units are visible", "Cost grows with each zone", "Filters need regular cleaning"] },
  ],
  costFactors: [
    { title: "System type", body: "A heat pump replaces both heating and cooling, so compare it with a furnace plus AC, not with AC alone." },
    { title: "Size", body: "Systems are sized in tons of cooling (12,000 BTU per hour each). Bigger homes and hotter climates need more tons; an oversized system short-cycles and costs more to run." },
    { title: "Efficiency", body: "Higher SEER2 and HSPF2 ratings cost more upfront and less to run. Variable-speed equipment also improves comfort and humidity control." },
    { title: "Ductwork", body: "Leaky or undersized ducts waste 20% or more of the energy. Repairs are often a few thousand dollars; full replacement depends on home size." },
    { title: "Rebates", body: "Utilities and states offer heat pump rebates that change often. Check your utility's site before you sign." },
  ],
  faqs: [
    { q: "How much does it cost to replace an HVAC system?", a: "A standard central AC or heat pump replacement for a mid-size home usually lands somewhere from the high four figures to the mid five figures installed, depending on size, efficiency and ductwork. The calculator sizes and prices it for your area." },
    { q: "What size AC or heat pump do I need?", a: "A rough rule is one ton per 550 to 700 sq ft depending on climate. A Manual J load calculation is the right way; a good contractor will do one." },
    { q: "Is a heat pump worth it?", a: "Often, if you are replacing both heating and cooling or currently heat with electric resistance, oil or propane. Where natural gas is very cheap and winters are harsh, a gas furnace can still cost less to run." },
  ],
  relatedGuides: ["heat-pump-vs-furnace", "how-to-read-a-contractor-quote", "questions-to-ask-before-hiring-a-contractor"],
};
