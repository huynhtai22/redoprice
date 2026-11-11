import { getProject, getVariant } from "../projects";
import { getMetro, getState, regionFor } from "../data";
import type { CardInput } from "./costCard";

/** Map a page path (project[/variant-or-state[/city]]) to what the cost card shows. */
export function resolveCard(project: string, slug?: string, city?: string): CardInput | null {
  const p = getProject(project);
  if (!p) return null;
  if (!slug) return { p };
  const variant = getVariant(p, slug);
  if (variant && !city) return { p, variant };
  const st = getState(slug);
  if (!st) return null;
  if (!city) return { p, region: regionFor(st) };
  const m = getMetro(slug, city);
  return m ? { p, region: regionFor(st, m) } : null;
}

export const OG_ALT = (c: CardInput) =>
  `${c.variant?.label ?? c.p.name} cost${c.region ? ` in ${c.region.label}` : ""}: typical price, fair range and cost breakdown`;
