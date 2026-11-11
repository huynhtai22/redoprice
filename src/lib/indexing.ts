/**
 * Programmatic pages are released in waves (see plan doc) so Google never sees thousands
 * of thin pages at once. Pages outside the active wave are still built and linked for
 * users, but carry `noindex` and are left out of the sitemap.
 *
 * NEXT_PUBLIC_INDEX_WAVE=1 (default): hubs, materials, comparisons, guides, all state pages,
 *                          and city pages for roofing only.
 * NEXT_PUBLIC_INDEX_WAVE=2: city pages for every project.
 */
import type { Project } from "./engine";

export const WAVE = Number(process.env.NEXT_PUBLIC_INDEX_WAVE ?? 1);

export function isIndexable(kind: "hub" | "variant" | "compare" | "state" | "city", p: Project) {
  if (kind !== "city") return true;
  return WAVE >= 2 || p.key === "roofing";
}
