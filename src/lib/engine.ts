import type { Region } from "./data";

export type Tag = "Budget" | "Mid-range" | "Premium";
export type Option = { value: string; label: string; hint?: string; tag?: Tag; swatch?: string };
export type Input =
  | { key: string; label: string; help?: string; type: "cards" | "segmented" | "select"; options: Option[] }
  | { key: string; label: string; help?: string; type: "slider"; min: number; max: number; step: number; unit: string; prefix?: string };

export type Inputs = Record<string, string | number>;
export type Line = { label: string; value: number };
export type Metric = { label: string; value: string; hint?: string };
export type Estimate = {
  low: number; typical: number; high: number;
  breakdown: Line[];
  perUnit?: { value: number; unit: string };
  metrics: Metric[];
  notes: string[];
  lifespanYears?: number;
};

export type Variant = {
  value: string; slug: string; label: string;
  blurb: string; pros: string[]; cons: string[];
  /** Inputs to preset on this variant's page (defaults to { [variantKey]: value }) */
  preset?: Inputs;
};

export type FAQ = { q: string; a: string };

export type Project = {
  key: "roofing" | "solar" | "hvac" | "fence" | "windows";
  slug: string;
  name: string;            // "Roof replacement"
  noun: string;            // "roof"
  calculatorName: string;  // "Roof Replacement Cost Calculator"
  short: string;
  intro: string;
  icon: string;
  variantKey: string;
  variantNoun: string;     // "material"
  variantPlural: string;   // "materials"
  inputs: (r: Region) => Input[];
  defaults: (r: Region) => Inputs;
  compute: (i: Inputs, r: Region) => Estimate;
  variants: Variant[];
  costFactors: { title: string; body: string }[];
  faqs: FAQ[];
  relatedGuides: string[];
  quoteNoun: string;       // "roofers"
};

/** Blend a national installed rate into a regional one. */
export const regional = (rate: number, laborShare: number, r: Region, laborFactor = 1) =>
  rate * (1 - laborShare) * r.materialIndex + rate * laborShare * r.laborIndex * laborFactor;

export const triple = <T,>(f: (i: 0 | 1 | 2) => T): [T, T, T] => [f(0), f(1), f(2)];
export const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
