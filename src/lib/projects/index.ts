import type { Project } from "../engine";
import { roofing } from "./roofing";
import { solar } from "./solar";
import { hvac } from "./hvac";
import { fence } from "./fence";
import { windows } from "./windows";

export const PROJECTS: Project[] = [roofing, solar, hvac, windows, fence];
export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
export const projectByKey = (key: string) => PROJECTS.find((p) => p.key === key)!;
export const getVariant = (p: Project, slug: string) => p.variants.find((v) => v.slug === slug);
export const variantPreset = (p: Project, slug: string) => {
  const v = getVariant(p, slug);
  return v ? v.preset ?? { [p.variantKey]: v.value } : {};
};

/** Curated head-to-head comparison pages ("metal vs asphalt roof cost"). Planner intent. */
export const COMPARISONS: Record<Project["key"], [string, string][]> = {
  roofing: [["standing-seam-metal", "architectural-shingles"], ["metal-shingles", "architectural-shingles"], ["concrete-tile", "architectural-shingles"], ["slate", "standing-seam-metal"]],
  fence: [["vinyl", "wood-privacy"], ["aluminum", "wrought-iron"], ["composite", "wood-privacy"], ["chain-link", "wood-privacy"]],
  windows: [["vinyl", "fiberglass"], ["vinyl", "wood"], ["fiberglass", "composite"]],
  hvac: [["heat-pump", "furnace-and-ac"], ["ductless-mini-split", "heat-pump"], ["heat-pump", "central-ac"]],
  solar: [],
};
export const comparisonSlug = (a: string, b: string) => `${a}-vs-${b}`;
export function parseComparison(p: Project, slug: string) {
  const pair = COMPARISONS[p.key].find(([a, b]) => comparisonSlug(a, b) === slug);
  if (!pair) return undefined;
  return [getVariant(p, pair[0])!, getVariant(p, pair[1])!] as const;
}

/**
 * Resale intent ("does a new roof add value"). ESTIMATE: share of project cost typically
 * recouped at sale, hand-set from general industry ranges, not copied from any report.
 * Replace with your own sourced figures before promoting these numbers.
 */
export const RESALE: Record<Project["key"], { recoupLow: number; recoupHigh: number; note: string }> = {
  roofing: { recoupLow: 0.5, recoupHigh: 0.65, note: "A new roof rarely raises the appraisal by its full cost, but an old roof is one of the most common reasons buyers ask for credits or lenders refuse to close." },
  windows: { recoupLow: 0.55, recoupHigh: 0.7, note: "Vinyl replacements tend to recoup more of their cost than premium wood, because buyers value condition more than the frame material." },
  hvac: { recoupLow: 0.35, recoupHigh: 0.55, note: "Buyers expect working heating and cooling. A newer system mainly prevents a price cut after inspection rather than adding value." },
  fence: { recoupLow: 0.4, recoupHigh: 0.6, note: "Privacy fences matter most to buyers with kids or pets. A worn fence can be a negotiating point." },
  solar: { recoupLow: 0.3, recoupHigh: 0.7, note: "Owned systems tend to add value in high-rate states; leased systems can complicate a sale because the buyer must take over the lease." },
};

/** DIY vs hire intent. Only for projects that are realistic for a homeowner. ESTIMATE. */
export const DIY: Partial<Record<Project["key"], { tools: [number, number]; unitsPerDay: number; unit: string; difficulty: string; warning: string }>> = {
  fence: { tools: [250, 600], unitsPerDay: 40, unit: "ft", difficulty: "Moderate: post holes and setting posts plumb are the hard part", warning: "Mark utilities by calling 811 first, and check the property line and HOA rules." },
  windows: { tools: [150, 400], unitsPerDay: 3, unit: "windows", difficulty: "Moderate to hard: flashing and air sealing decide how well the window performs", warning: "Manufacturer warranties often require professional installation. Pre-1978 homes need lead-safe practices." },
};
