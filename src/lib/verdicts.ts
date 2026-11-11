/**
 * "Repair or replace?" and "DIY or hire?" verdicts for every project.
 *
 * Repair or replace compares cost per year of use: what a repair costs divided by the years
 * it realistically buys, against the new item's price divided by its lifespan. Repair-cost
 * ranges are data (national-costs-depth.json > repairs); rules and copy live here.
 *
 * ESTIMATE: horizons, DIY tool costs and pace are hand-set from general trade practice.
 */
import { DEPTH } from "./data";
import type { Estimate, Inputs, ProjectKey } from "./engine";

export type RepairCfg = {
  /** What the thing is called when it's the old one: "your roof" */
  item: string;
  /** Typical life of what is there now, if the estimate has none */
  life?: number;
  /** Most years a repair can realistically add, even on a young item */
  horizon: number;
  /** Words used in the verdict stamp */
  repairWord?: string; replaceWord?: string;
  signs: string[];
  rule: string;
  flags?: { label: string; call: "replace" | "inspect"; why: string }[];
};

export type DiyCfg = {
  level: "diy" | "skilled" | "pro";
  tools: [number, number];
  /** Pace for two people: units of `unitKey` per day, or a fixed number of days */
  unitKey?: string; unitsPerDay?: number; days?: number;
  /** Share of the labor line a homeowner actually avoids (some steps still need a pro) */
  saved?: number;
  skills: string;
  risks: string;
};

export const REPAIR: Record<ProjectKey, RepairCfg> = {
  roofing: { item: "your roof", horizon: 8, signs: ["Curling, cupping or bald shingles across several slopes", "Granules piling up in the gutters", "Daylight or water stains in the attic", "Sagging roof lines or soft decking"], rule: "Past about three quarters of its life, or with damage on several slopes, repairs buy little time.",
    flags: [{ label: "Sagging, soft decking or water in the attic", call: "inspect", why: "That can mean structural or decking damage. Tarp it and get a roofer to inspect before you spend on either option." }] },
  solar: { item: "your solar system", life: 25, horizon: 10, repairWord: "Repair", signs: ["Production down more than 20% with no shading change", "Inverter error codes that keep returning", "Cracked glass, burn marks or delaminating panels"], rule: "Inverters fail long before panels. Replacing an inverter almost always beats replacing the array." },
  hvac: { item: "your system", life: 15, horizon: 5, signs: ["Repairs in two seasons running", "Rooms that never reach the set temperature", "Bills rising with no change in use", "R-22 refrigerant (most systems installed before 2010)"], rule: "The $5,000 rule: if the age times the repair cost is over $5,000, replacement is usually the better value.",
    flags: [{ label: "It uses R-22 refrigerant", call: "replace", why: "R-22 is no longer produced. Refrigerant work on these systems is expensive and the system is near the end of its life anyway." }] },
  windows: { item: "your windows", life: 25, horizon: 10, signs: ["Fog between the panes on many windows", "Rotting sills or sashes", "Drafts you feel with your hand", "Windows that will not stay open or lock"], rule: "One foggy pane is a glass swap. Rot or drafts across most windows is a replacement." },
  fence: { item: "your fence", horizon: 6, signs: ["Leaning sections after storms", "Several rotted posts at ground level", "Boards splitting faster than you can replace them"], rule: "Posts decide it. When more than a third of the posts are rotted, replacement usually wins." },
  gutters: { item: "your gutters", horizon: 6, signs: ["Leaking seams no matter how often you reseal", "Rust holes or cracks", "Water marks or rot on the fascia behind them", "Pulling away from the house"], rule: "Seams and hangers are cheap fixes. Rust-through, cracked vinyl or rotted fascia means replace." },
  siding: { item: "your siding", horizon: 8, signs: ["Rot, soft spots or warping across whole walls", "Peeling paint inside, or mold on interior walls", "Cracked or missing panels on several sides"], rule: "Damage on one wall is a repair. Problems on several sides, or water getting behind it, point to replacement." },
  deck: { item: "your deck", horizon: 6, signs: ["Soft or spongy boards", "Rot at posts, joists or the ledger board", "Wobbly railings or stairs", "Rusted connectors and hangers"], rule: "Boards are a repair; the frame is the deck. If joists, posts or the ledger are rotting, replace for safety.",
    flags: [{ label: "Rot where the deck attaches to the house (ledger)", call: "inspect", why: "Ledger failure is the leading cause of deck collapses. Stay off it and have it inspected before deciding." }] },
  exteriorPaint: { item: "your paint job", life: 10, horizon: 3, repairWord: "Touch up", replaceWord: "Repaint", signs: ["Peeling or blistering on several walls", "Chalky residue that comes off on your hand", "Bare wood showing"], rule: "Touch up only when failure is limited to one sunny wall or trim. Bare wood anywhere means repaint before rot starts." },
  driveway: { item: "your driveway", horizon: 8, repairWord: "Repair or resurface", signs: ["Cracks wider than a quarter inch spreading across the slab", "Potholes or crumbling edges", "Standing water and sunken sections", "Heaving from tree roots"], rule: "Seal and patch when cracks are isolated. When the base has failed (sinking, crumbling, wide spiderweb cracks), replace." },
  garageDoor: { item: "your garage door", horizon: 10, signs: ["Rusted-through or cracked panels", "Door is over 20 years old with no insulation", "Repeated off-track problems"], rule: "Springs, cables and rollers are routine repairs. Replace when panels fail or repairs stack up on an old door." },
  waterHeater: { item: "your water heater", horizon: 3, signs: ["Rusty water or rust around the base", "Water pooling under the tank", "Rumbling, popping noises", "Over 10 years old (check the serial number for the date)"], rule: "Leaks from the tank itself cannot be repaired. Parts like elements, thermocouples and valves are worth fixing on a tank under about 8 years old.",
    flags: [{ label: "The tank itself is leaking", call: "replace", why: "A leaking tank cannot be fixed. Shut off the water and power or gas and replace it before it fails completely." }] },
  electricalPanel: { item: "your panel", life: 40, horizon: 10, signs: ["Breakers that trip often or feel hot", "Burning smell, scorch marks or buzzing", "Fuses instead of breakers", "Federal Pacific, Zinsco or Challenger brand"], rule: "A bad breaker is a cheap repair. Scorching, a recalled brand or no room for new circuits means replace.",
    flags: [{ label: "Federal Pacific, Zinsco or scorch marks", call: "replace", why: "These panels have well-known breaker failures and many insurers will not cover them. Scorch marks mean overheating. Replace, and do not wait." }] },
  insulation: { item: "your insulation", horizon: 15, repairWord: "Top up", replaceWord: "Remove and redo", signs: ["Less than 10 inches on the attic floor", "Wet, moldy or rodent-damaged areas", "Ice dams in winter or a hot upstairs in summer"], rule: "Dry, clean insulation can be topped up. Remove it first if it is wet, moldy, contaminated or vermiculite.",
    flags: [{ label: "Gray-brown pebbly vermiculite", call: "inspect", why: "Vermiculite may contain asbestos. Do not disturb it; have it tested before any work." }] },
  kitchen: { item: "your kitchen", life: 20, horizon: 8, repairWord: "Refresh", replaceWord: "Remodel", signs: ["Cabinet boxes sagging, water-damaged or delaminating", "Not enough outlets, or old wiring", "A layout that does not work for how you cook"], rule: "If the cabinet boxes and layout are sound, a refresh gets most of the look for a fraction of the cost." },
  bathroom: { item: "your bathroom", life: 20, horizon: 6, repairWord: "Refresh", replaceWord: "Remodel", signs: ["Soft floor near the toilet or tub", "Cracked tile or grout that lets water through", "Mold that comes back after cleaning", "Leaking valves inside the wall"], rule: "Cosmetic wear is a refresh. Soft floors or water behind the tile mean the room needs a gut remodel." },
  flooring: { item: "your floors", horizon: 8, repairWord: "Repair or refinish", signs: ["Water damage, cupping or buckling", "Worn through the finish or wear layer", "Stains and odors in carpet that do not clean out"], rule: "Solid hardwood can be refinished many times, so it rarely needs replacing. Laminate, vinyl and carpet do." },
  interiorPaint: { item: "your walls", life: 8, horizon: 2, repairWord: "Touch up", replaceWord: "Repaint", signs: ["Scuffs that wash off the paint, not just the dirt", "Fading and mismatched touch-ups", "You are selling or changing colors"], rule: "Touch-ups rarely blend after a few years. Repaint the whole wall, corner to corner." },
  basement: { item: "your basement finish", life: 30, horizon: 8, repairWord: "Repair", replaceWord: "Redo", signs: ["Musty smells or visible mold", "Water staining at the base of walls", "Efflorescence (white powder) on the foundation"], rule: "Fix the water source first. If water got behind drywall, cut out to above the waterline and rebuild with moisture-resistant materials." },
  sewer: { item: "your sewer line", life: 50, horizon: 6, signs: ["Clogs that keep coming back", "Several drains backing up at once", "Sewage smell or soggy patches in the yard", "Clay or cast iron pipe over 50 years old"], rule: "One bad joint on the camera is a spot repair. Several breaks, sags or heavy root intrusion along the line mean replace.",
    flags: [{ label: "Camera shows a collapse or a long sag (belly)", call: "replace", why: "Collapsed pipe and sags trap waste and cannot be fixed with cleaning or lining. The section needs replacing." }] },
};

export const DIY: Record<ProjectKey, DiyCfg> = {
  roofing: { level: "pro", tools: [600, 1500], unitKey: "homeSqft", unitsPerDay: 400, saved: 0.9, skills: "Roofing is fall-risk work with heavy materials and strict flashing details.", risks: "Most shingle warranties require a certified installer, and falls are the leading cause of construction deaths." },
  solar: { level: "pro", tools: [500, 1500], days: 4, saved: 0.6, skills: "Racking, DC wiring, rapid shutdown and utility interconnection.", risks: "Utilities and inspectors usually require a licensed electrician to sign off, and DIY installs can lose equipment warranties." },
  hvac: { level: "pro", tools: [800, 2000], days: 3, saved: 0.85, skills: "Refrigerant handling needs EPA Section 608 certification; gas and electrical work need permits.", risks: "Manufacturer warranties usually require a licensed installer. Incorrect charge or sizing kills efficiency and compressors." },
  windows: { level: "skilled", tools: [150, 400], unitKey: "count", unitsPerDay: 3, saved: 1, skills: "Measuring precisely, shimming square and flashing correctly decide how well the window performs.", risks: "Manufacturer warranties often require professional installation. Pre-1978 homes need lead-safe practices." },
  fence: { level: "diy", tools: [250, 600], unitKey: "length", unitsPerDay: 40, saved: 1, skills: "Setting posts plumb, in line and deep enough is the hard part; panels go up fast after that.", risks: "Call 811 before digging, and confirm the property line and HOA rules." },
  gutters: { level: "skilled", tools: [150, 400], unitKey: "length", unitsPerDay: 60, saved: 0.9, skills: "Ladder work, setting the right slope and sealing corners. Seamless gutters need a machine, so DIY means sectional.", risks: "Ladder falls are the main danger. Sectional gutters leak at joints more than seamless." },
  siding: { level: "skilled", tools: [400, 1200], unitKey: "area", unitsPerDay: 200, saved: 1, skills: "House wrap, flashing around windows and keeping courses level over a whole wall.", risks: "Fiber cement cutting needs silica dust control. Poor flashing causes hidden rot." },
  deck: { level: "skilled", tools: [400, 1000], unitKey: "area", unitsPerDay: 40, saved: 1, skills: "Footings, a properly flashed and bolted ledger, joist hangers and railing that passes inspection.", risks: "Needs a permit and inspections. Ledger mistakes are the top cause of deck collapses." },
  exteriorPaint: { level: "diy", tools: [300, 800], unitKey: "area", unitsPerDay: 250, saved: 1, skills: "Patience with scraping, priming and caulking. Spraying is fast but needs masking skill.", risks: "Ladder work on tall walls. Homes built before 1978 need lead-safe prep." },
  driveway: { level: "pro", tools: [800, 2500], days: 3, saved: 0.7, skills: "Grading, compacting a base and finishing concrete or asphalt before it sets.", risks: "Concrete and asphalt need trucks, compactors and a crew working fast. Mistakes are permanent." },
  garageDoor: { level: "pro", tools: [150, 400], days: 1, saved: 1, skills: "Installing panels is simple; winding torsion springs is not.", risks: "Torsion springs store enough energy to cause serious injury. Most pros will not warranty doors they did not hang." },
  waterHeater: { level: "skilled", tools: [100, 300], days: 1, saved: 1, skills: "Sweating or crimping pipe, gas connections, venting and relief valve piping.", risks: "Gas leaks and bad venting can cause carbon monoxide poisoning. Many cities require a permit and inspection." },
  electricalPanel: { level: "pro", tools: [300, 800], days: 1, saved: 0.9, skills: "Service-entrance work with the utility, grounding and bonding to current code.", risks: "Lethal voltage on the service side even with the main off. Utilities will not reconnect without an inspection." },
  insulation: { level: "diy", tools: [100, 300], unitKey: "area", unitsPerDay: 1000, saved: 1, skills: "Air sealing first, then blowing evenly to depth. Many home centers lend the blower free with a material purchase.", risks: "Hot, cramped attics; wear a respirator. Keep insulation away from flues and old recessed lights." },
  kitchen: { level: "skilled", tools: [800, 2500], unitKey: "area", unitsPerDay: 6, saved: 0.5, skills: "Demolition, cabinet install, tile and painting are DIY-able. Plumbing, gas and electrical usually need licensed trades.", risks: "Months without a kitchen if it stalls. Permits still apply to plumbing and electrical." },
  bathroom: { level: "skilled", tools: [500, 1500], unitKey: "area", unitsPerDay: 3, saved: 0.6, skills: "Waterproofing the shower, setting tile flat and plumbing the valve.", risks: "A waterproofing mistake can rot the floor within a few years. Plumbing permits apply." },
  flooring: { level: "diy", tools: [150, 500], unitKey: "area", unitsPerDay: 200, saved: 1, skills: "Click-together LVP and laminate are very DIY friendly. Tile and nail-down hardwood are harder.", risks: "Skipping subfloor prep or expansion gaps causes squeaks, gaps and buckling." },
  interiorPaint: { level: "diy", tools: [150, 400], unitKey: "area", unitsPerDay: 300, saved: 1, skills: "Cutting in neat lines and rolling evenly. Ceilings are the hard part.", risks: "Pre-1978 homes need lead-safe sanding. Otherwise this is the most DIY-friendly job on the list." },
  basement: { level: "skilled", tools: [800, 2000], unitKey: "area", unitsPerDay: 25, saved: 0.6, skills: "Framing, insulation and drywall are DIY-able. Electrical, plumbing and egress often need pros and inspections.", risks: "Finishing over moisture leads to mold. Unpermitted basements cause trouble at sale." },
  sewer: { level: "pro", tools: [1000, 3000], days: 3, saved: 0.6, skills: "Excavation, shoring, pipe slope and city connection.", risks: "Trench collapse can be fatal, and the city usually requires a licensed contractor to connect to the main." },
};

export type RepairVerdict = { call: string; tone: "good" | "warn" | "bad"; why: string; repairPerYear: number; replacePerYear: number; yearsBought: number };

export function repairVerdict(key: ProjectKey, est: Estimate, age: number, repair: number, flag?: number): RepairVerdict {
  const c = REPAIR[key];
  const life = est.lifespanYears ?? c.life ?? 20;
  const replace = est.typical;
  const remaining = life - age;
  const yearsBought = Math.max(1, Math.min(c.horizon, remaining > 0 ? remaining : 1));
  const repairPerYear = repair / yearsBought;
  const replacePerYear = replace / life;
  const R = c.repairWord ?? "Repair", P = c.replaceWord ?? "Replace";
  const base = { repairPerYear, replacePerYear, yearsBought };
  const f = flag !== undefined ? c.flags?.[flag] : undefined;
  if (f) return { ...base, call: f.call === "replace" ? P : "Get it inspected", tone: "bad", why: f.why };
  const ratio = repairPerYear / replacePerYear;
  if (age >= life) return { ...base, call: P, tone: "warn", why: `${cap(c.item)} is ${age} years into a typical ${life}-year life. Any repair buys about a year, so put the money toward the replacement.` };
  if (repair >= replace * 0.5) return { ...base, call: P, tone: "warn", why: `The repair is ${Math.round((repair / replace) * 100)}% of the cost of a new one. Past half, replacing almost always wins.` };
  if (ratio < 0.6 && age < life * 0.75) return { ...base, call: R, tone: "good", why: `The repair costs less per year of use than replacing, and ${c.item} has about ${remaining} years left.` };
  if (ratio < 1) return { ...base, call: `${R}, then save`, tone: "warn", why: `${R} wins on cost per year for now, but ${c.item} is ${Math.round((age / life) * 100)}% through its life. Start budgeting for the replacement.` };
  return { ...base, call: P, tone: "warn", why: `Each year the repair buys costs more than a year of a new one. Replacing is better value.` };
}

export const commonRepairs = (key: ProjectKey) => (DEPTH.repairs as Record<string, { label: string; cost: number[] }[]>)[key] ?? [];

export type DiyVerdict = { call: string; tone: "good" | "warn" | "bad"; laborSaved: number; tools: number; net: number; days: number; perHour: number };

export function diyVerdict(key: ProjectKey, est: Estimate, inputs: Inputs): DiyVerdict {
  const c = DIY[key];
  const laborLines = est.breakdown.filter((l) => /labor/i.test(l.label));
  const labor = laborLines.length ? laborLines.reduce((a, l) => a + l.value, 0) : est.typical * 0.45;
  const laborSaved = labor * (c.saved ?? 1);
  const tools = (c.tools[0] + c.tools[1]) / 2;
  const net = laborSaved - tools;
  const units = c.unitKey ? Number(inputs[c.unitKey] ?? 0) : 0;
  const days = c.days ?? Math.max(1, Math.ceil(units / (c.unitsPerDay ?? 1)));
  const perHour = net / (days * 8 * 2);
  const call = c.level === "pro" ? "Hire a pro" : c.level === "skilled" ? (net > 0 ? "DIY if you're handy" : "Hire a pro") : net > 0 ? "Good DIY job" : "Hire a pro";
  const tone = call === "Good DIY job" ? "good" : call === "Hire a pro" ? (c.level === "pro" ? "bad" : "warn") : "warn";
  return { call, tone, laborSaved, tools, net, days, perHour };
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
