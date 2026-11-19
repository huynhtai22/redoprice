/**
 * Programmatic pages are released in waves (see plan doc) so Google never sees thousands
 * of thin pages at once. Pages outside the active wave are still built and linked for
 * users, but carry `noindex` and are left out of the sitemap.
 *
 * NEXT_PUBLIC_INDEX_WAVE=1 (default): hubs, materials, comparisons, guides, all state pages,
 *                          and city pages for roofing only.
 * NEXT_PUBLIC_INDEX_WAVE=2: city pages for every project, and state pages for the newer projects.
 */
import type { Project } from "./engine";

export const WAVE = Number(process.env.NEXT_PUBLIC_INDEX_WAVE ?? 1);

const LAUNCH = ["roofing", "solar", "hvac", "windows", "fence"];

/**
 * Projects added in Nov 2026 (gutters, kitchens, ...) ship hub, material and comparison
 * pages only. Their state pages are built but noindexed, and their city pages are not
 * built at all, until wave 2 (after AdSense approval).
 */
export const hasCityPages = (p: Project) => WAVE >= 2 || LAUNCH.includes(p.key);

export function isIndexable(kind: "hub" | "variant" | "compare" | "state" | "city", p: Project) {
  if (kind === "hub" || kind === "variant" || kind === "compare") return true;
  if (!LAUNCH.includes(p.key)) return WAVE >= 2;
  if (kind === "state") return true;
  return WAVE >= 2 || p.key === "roofing";
}
