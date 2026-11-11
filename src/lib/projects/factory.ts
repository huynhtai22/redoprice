/**
 * Shared builder for "quantity x rate" projects (gutters, siding, flooring, kitchens...).
 * Rates and option multipliers live in src/data/<version>/national-costs-depth.json; the
 * copy (labels, pros/cons, FAQs) lives in each project file. One compute path means every
 * project gets the same breakdown, regional adjustment and min-job rule.
 */
import { DEPTH, HOUSING, type Region } from "../data";
import { formatNum, formatUSD, formatUSD2 } from "../format";
import { regional, type FAQ, type Input, type Inputs, type Line, type Metric, type Option, type Project, type ProjectGroup, type ProjectKey, type Tag } from "../engine";

type Triple = [number, number, number];
type Rate = { low: number; typical: number; high: number; laborShare: number; lifespanYears: number };
type OptData = { factor?: number; laborFactor?: number; add?: number[]; addPerUnit?: number[] };
type DepthEntry = {
  unit: string;
  materials: Record<string, Rate>;
  options?: Record<string, Record<string, OptData>>;
  removalPerUnit?: number[];
  permit: number[];
  minJob?: number;
};

export type MaterialSpec = {
  value: string; slug?: string; label: string; short?: string; hint?: string; tag?: Tag;
  blurb: string; pros: string[]; cons: string[];
};

export type OptionSpec = {
  key: string; label: string; help?: string;
  options: { value: string; label: string; hint?: string }[];
  default: string;
  /** Label used for add-on lines in the breakdown */
  lineLabel?: string;
};

export type QtySpec = {
  key: string; label: string; help?: string; min: number; max: number; step: number; unit: string;
  default: number | ((r: Region) => number);
  /** Singular unit for "cost per ..." (defaults to the data unit) */
  per?: string;
};

export type Spec = {
  key: ProjectKey; group: ProjectGroup; dataKey: keyof typeof DEPTH;
  slug: string; name: string; noun: string; calculatorName: string; short: string; intro: string;
  variantKey?: string; variantNoun: string; variantPlural: string; materialLabel: string;
  quoteNoun: string;
  materials: MaterialSpec[];
  defaultMaterial: string;
  /** Omit for one-off jobs (a water heater, a panel): quantity is 1 */
  qty?: QtySpec;
  options?: OptionSpec[];
  removal?: { label: string; line: string; defaultOn?: boolean };
  extraMetrics?: (ctx: { i: Inputs; qty: number; typical: number; m: Rate }) => Metric[];
  notes: string[];
  costFactors: { title: string; body: string }[];
  faqs: FAQ[];
  relatedGuides: string[];
};

export const homeSqft = (r: Region) => HOUSING.typicalHomeSqft[r.state.code] ?? 1900;
export const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export function makeProject(s: Spec): Project {
  const D = DEPTH[s.dataKey] as unknown as DepthEntry;
  const variantKey = s.variantKey ?? "material";
  const opts = s.options ?? [];

  const inputs = (): Input[] => {
    const list: Input[] = [{
      key: variantKey, label: s.materialLabel, type: s.materials.length > 3 ? "cards" : "segmented",
      options: s.materials.map<Option>((m) => ({ value: m.value, label: m.short ?? m.label, hint: m.hint, tag: m.tag })),
    }];
    if (s.qty) list.push({ key: s.qty.key, label: s.qty.label, help: s.qty.help, type: "slider", min: s.qty.min, max: s.qty.max, step: s.qty.step, unit: s.qty.unit });
    for (const o of opts) list.push({ key: o.key, label: o.label, help: o.help, type: "segmented", options: o.options });
    if (s.removal) list.push({ key: "removal", label: s.removal.label, type: "segmented", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] });
    return list;
  };

  const defaults = (r: Region): Inputs => {
    const d: Inputs = { [variantKey]: s.defaultMaterial };
    if (s.qty) d[s.qty.key] = typeof s.qty.default === "function" ? s.qty.default(r) : s.qty.default;
    for (const o of opts) d[o.key] = o.default;
    if (s.removal) d.removal = s.removal.defaultOn ? "yes" : "no";
    return d;
  };

  const compute = (i: Inputs, r: Region) => {
    const m = D.materials[String(i[variantKey])] ?? D.materials[s.defaultMaterial];
    const qty = s.qty ? Math.max(s.qty.min, Number(i[s.qty.key]) || s.qty.min) : 1;
    let factor = 1, laborFactor = 1;
    const adds: { label: string; t: Triple }[] = [];
    for (const o of opts) {
      const od = D.options?.[o.key]?.[String(i[o.key])];
      if (!od) continue;
      factor *= od.factor ?? 1;
      laborFactor *= od.laborFactor ?? 1;
      const label = `${o.lineLabel ?? o.label}: ${o.options.find((x) => x.value === String(i[o.key]))?.label ?? ""}`.replace(/: $/, "");
      if (od.add) adds.push({ label, t: od.add as Triple });
      if (od.addPerUnit) adds.push({ label, t: od.addPerUnit.map((x) => x * qty) as Triple });
    }
    const rates = [m.low, m.typical, m.high];
    const rem = s.removal && i.removal === "yes" && D.removalPerUnit;
    const base = (k: 0 | 1 | 2) => regional(rates[k] * factor, m.laborShare, r, laborFactor) * qty;
    const extra = (k: 0 | 1 | 2) => adds.reduce((a, x) => a + regional(x.t[k], 0.5, r), 0);
    const removal = (k: 0 | 1 | 2) => (rem ? D.removalPerUnit![k] * qty * r.laborIndex : 0);
    const permit = (k: 0 | 1 | 2) => D.permit[k] * r.laborIndex;
    const minJob = (D.minJob ?? 0) * r.laborIndex;
    const total = (k: 0 | 1 | 2) => Math.max(minJob * [0.85, 1, 1.2][k], base(k) + extra(k) + removal(k) + permit(k));
    const [low, typical, high] = [total(0), total(1), total(2)];

    const mat = m.typical * factor * (1 - m.laborShare) * r.materialIndex * qty;
    const lab = m.typical * factor * m.laborShare * r.laborIndex * laborFactor * qty;
    const lines: Line[] = [
      { label: "Materials", value: mat },
      { label: "Labor", value: lab },
      ...adds.map((a) => ({ label: a.label, value: regional(a.t[1], 0.5, r) })),
      { label: s.removal?.line ?? "Removal & disposal", value: removal(1) },
      { label: "Permit & inspection", value: permit(1) },
    ].filter((l) => l.value > 0);
    // Small jobs hit the contractor's minimum: show it as its own line so the math adds up.
    const sum = lines.reduce((a, l) => a + l.value, 0);
    if (typical > sum + 1) lines.push({ label: "Minimum job charge", value: typical - sum });

    const per = s.qty?.per ?? D.unit;
    const perVal = typical / qty;
    const metrics: Metric[] = [
      ...(s.qty ? [{ label: `Cost per ${per}`, value: perVal < 50 ? formatUSD2(perVal) : formatUSD(perVal), hint: "all-in" }] : []),
      { label: "Expected lifespan", value: `${m.lifespanYears} years` },
      { label: "Cost per year of life", value: formatUSD(typical / m.lifespanYears) },
      ...(s.extraMetrics?.({ i, qty, typical, m }) ?? []),
    ];
    return {
      low, typical, high, breakdown: lines,
      perUnit: s.qty ? { value: perVal, unit: per } : undefined,
      metrics, notes: s.notes, lifespanYears: m.lifespanYears,
    };
  };

  return {
    key: s.key, group: s.group, permit: D.permit as Triple,
    slug: s.slug, name: s.name, noun: s.noun, calculatorName: s.calculatorName, short: s.short, intro: s.intro,
    icon: s.key, variantKey, variantNoun: s.variantNoun, variantPlural: s.variantPlural, quoteNoun: s.quoteNoun,
    inputs, defaults, compute,
    variants: s.materials.map((m) => ({ value: m.value, slug: m.slug ?? m.value, label: m.label, blurb: m.blurb, pros: m.pros, cons: m.cons })),
    costFactors: s.costFactors, faqs: s.faqs, relatedGuides: s.relatedGuides,
  };
}

export const fmtQty = (n: number, unit: string) => `${formatNum(n)} ${unit}`;
