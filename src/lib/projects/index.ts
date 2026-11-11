import type { Project, ProjectGroup } from "../engine";
import { roofing } from "./roofing";
import { solar } from "./solar";
import { hvac } from "./hvac";
import { fence } from "./fence";
import { windows } from "./windows";
import { gutters, siding, deck, exteriorPaint, driveway, garageDoor } from "./outside";
import { waterHeater, electricalPanel, insulation, sewer } from "./systems";
import { kitchen, bathroom, flooring, interiorPaint, basement } from "./inside";

/** The five launch calculators come first: they lead navigation and the home page switcher. */
export const LAUNCH_KEYS = ["roofing", "solar", "hvac", "windows", "fence"] as const;
export const PROJECTS: Project[] = [
  roofing, solar, hvac, windows, fence,
  kitchen, bathroom, siding, gutters, deck, waterHeater, flooring, driveway, garageDoor,
  electricalPanel, insulation, exteriorPaint, interiorPaint, basement, sewer,
];
export const isLaunchProject = (p: Project) => (LAUNCH_KEYS as readonly string[]).includes(p.key);

/** Projects grouped by where they are on the house, for navigation and the project index. */
export const PROJECT_GROUPS: { key: ProjectGroup; label: string; blurb: string; projects: Project[] }[] = [
  { key: "outside", label: "Roof and outside", blurb: "The shell that keeps the weather out.", projects: [] },
  { key: "systems", label: "Systems", blurb: "Heat, power, water and what runs behind the walls.", projects: [] },
  { key: "inside", label: "Inside", blurb: "Rooms you live in.", projects: [] },
];
for (const p of PROJECTS) PROJECT_GROUPS.find((g) => g.key === p.group)!.projects.push(p);
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
  gutters: [["seamless-aluminum", "vinyl"], ["copper", "seamless-aluminum"]],
  siding: [["fiber-cement", "vinyl"], ["engineered-wood", "fiber-cement"], ["vinyl", "cedar"]],
  deck: [["composite", "pressure-treated"], ["pvc", "composite"], ["cedar", "pressure-treated"]],
  exteriorPaint: [],
  driveway: [["concrete", "asphalt"], ["pavers", "stamped-concrete"], ["asphalt", "gravel"]],
  garageDoor: [["insulated-steel", "steel"], ["composite", "wood"]],
  waterHeater: [["tankless-gas", "gas-tank"], ["heat-pump", "electric-tank"], ["gas-tank", "electric-tank"]],
  electricalPanel: [["upgrade-200a", "smart-panel"]],
  insulation: [["blown-cellulose", "blown-fiberglass"], ["open-cell-foam", "closed-cell-foam"], ["blown-fiberglass", "fiberglass-batts"]],
  sewer: [["pipe-bursting", "traditional"], ["pipe-lining", "pipe-bursting"]],
  kitchen: [],
  bathroom: [],
  flooring: [["luxury-vinyl-plank", "laminate"], ["engineered-hardwood", "solid-hardwood"], ["luxury-vinyl-plank", "engineered-hardwood"], ["porcelain-tile", "luxury-vinyl-plank"]],
  interiorPaint: [],
  basement: [],
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
  gutters: { recoupLow: 0.4, recoupHigh: 0.6, note: "Buyers rarely pay extra for gutters, but missing or failing ones get flagged by inspectors because of the water damage they cause." },
  siding: { recoupLow: 0.6, recoupHigh: 0.8, note: "Siding is one of the better-returning exterior projects because it changes curb appeal and first impressions at once." },
  deck: { recoupLow: 0.45, recoupHigh: 0.65, note: "Wood decks tend to recoup a little more of their cost than composite, because buyers do not pay much extra for the upgrade." },
  exteriorPaint: { recoupLow: 0.5, recoupHigh: 0.8, note: "Fresh paint is one of the cheapest ways to help a listing photograph well. Neutral colors appeal to the most buyers." },
  driveway: { recoupLow: 0.3, recoupHigh: 0.5, note: "A cracked, sunken driveway hurts first impressions more than a new one helps, so it matters most if yours is in poor shape." },
  garageDoor: { recoupLow: 0.7, recoupHigh: 1.0, note: "A new garage door is consistently one of the highest-returning projects, because it is a large part of the front of many homes." },
  waterHeater: { recoupLow: 0.2, recoupHigh: 0.4, note: "Buyers expect hot water. A new heater mainly avoids an inspection credit; it rarely adds value on its own." },
  electricalPanel: { recoupLow: 0.3, recoupHigh: 0.6, note: "An outdated or recalled panel can stop a sale or an insurance policy. A 200 amp panel is a selling point for EV-owning buyers." },
  insulation: { recoupLow: 0.5, recoupHigh: 1.0, note: "Insulation is invisible to most buyers but shows up in lower energy bills and in energy audits that some markets disclose." },
  sewer: { recoupLow: 0.1, recoupHigh: 0.3, note: "Sewer scopes are now common during home inspections. A recent replacement removes a big negotiating point for buyers." },
  kitchen: { recoupLow: 0.35, recoupHigh: 0.75, note: "Minor and mid-range remodels recoup the most. Upscale kitchens tend to recoup the least of their cost." },
  bathroom: { recoupLow: 0.45, recoupHigh: 0.7, note: "Updating a dated bathroom tends to pay back better than adding luxury to one that is already in good shape." },
  flooring: { recoupLow: 0.5, recoupHigh: 0.8, note: "Hardwood floors are among the features buyers ask for most. Replacing worn carpet with any hard floor tends to help." },
  interiorPaint: { recoupLow: 0.6, recoupHigh: 1.0, note: "Neutral, fresh paint is a standard pre-listing step that agents recommend because it helps a home show and photograph well." },
  basement: { recoupLow: 0.5, recoupHigh: 0.7, note: "Appraisers value below-grade space lower than above-grade, but a permitted, dry finished basement still adds living space buyers pay for." },
};
