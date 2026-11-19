/**
 * Indexing rollout for programmatic pages. Every page is built and linked for users, but pages
 * outside the active wave carry `noindex, follow` and stay out of the sitemap, so Google never
 * sees hundreds of near-identical city pages at once (and AdSense reviewers see a lean site).
 *
 * To release the next wave: set NEXT_PUBLIC_INDEX_WAVE in Vercel to the wave number and redeploy
 * (one deploy per wave). Playbook and go/no-go checks: docs/ROLLOUT.md. Status: `npm run rollout:status`.
 */
import type { Project } from "./engine";
import type { MetroRow } from "./data";
import { approvedCount, MIN_SAMPLE } from "./communityQuotes";

type CityRule = { projects: string[] | "*"; maxRank: number };
export type Wave = { wave: number; name: string; release: string; cities: CityRule[] };

export const WAVES: Wave[] = [
  { wave: 1, name: "Launch and AdSense review", release: "Now. Hubs, materials, comparisons, guides, tools and state pages. No city pages.", cities: [] },
  { wave: 2, name: "Top 10 metros, roofing and HVAC", release: "After AdSense approval.", cities: [{ projects: ["roofing", "hvac"], maxRank: 10 }] },
  { wave: 3, name: "Top 10 metros, every project", release: "2+ weeks after wave 2, once most wave 2 pages are indexed.", cities: [{ projects: "*", maxRank: 10 }] },
  { wave: 4, name: "Top 25 metros, every project", release: "2+ weeks after wave 3.", cities: [{ projects: "*", maxRank: 25 }] },
  { wave: 5, name: "All metros", release: "2+ weeks after wave 4.", cities: [{ projects: "*", maxRank: Infinity }] },
];

export const WAVE = Number(process.env.NEXT_PUBLIC_INDEX_WAVE ?? 1);
export const activeWaves = () => WAVES.filter((w) => w.wave <= WAVE);

/** Which wave first indexes this city page (Infinity if none). */
export function cityWave(p: Pick<Project, "key">, metro: Pick<MetroRow, "rank">) {
  const w = WAVES.find((x) => x.cities.some((c) => (c.projects === "*" || c.projects.includes(p.key)) && metro.rank <= c.maxRank));
  return w?.wave ?? Infinity;
}

/**
 * City pages also qualify early, from wave 2, when their state has enough moderated real quotes
 * for the project: the page then carries data no one else has, which is the point of indexing it.
 */
const earned = (p: Pick<Project, "key">, metro?: Pick<MetroRow, "state">) =>
  WAVE >= 2 && !!metro && approvedCount(p.key, metro.state) >= MIN_SAMPLE;

export function isIndexable(kind: "hub" | "variant" | "compare" | "state" | "city", p: Pick<Project, "key">, metro?: Pick<MetroRow, "rank" | "state">) {
  if (kind !== "city") return true;
  if (!metro) return false;
  return cityWave(p, metro) <= WAVE || earned(p, metro);
}
