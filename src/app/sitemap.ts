import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { COMPARISONS, PROJECTS, comparisonSlug } from "@/lib/projects";
import { DATA_UPDATED, METROS, STATES } from "@/lib/data";
import { GUIDES } from "@/lib/guides";
import { isIndexable } from "@/lib/indexing";

/** Only pages in the active indexing wave are listed (see src/lib/indexing.ts). */
export default function sitemap(): MetadataRoute.Sitemap {
  const d = new Date(DATA_UPDATED);
  const u = (p: string, priority = 0.6) => ({ url: `${SITE.url}${p}`, lastModified: d, priority });
  const out = [u("", 1), u("/check-my-quote", 0.8), u("/repair-or-replace", 0.8), u("/planner", 0.6), u("/guides", 0.5), u("/how-we-calculate", 0.5), u("/share-your-quote", 0.4), u("/about", 0.3), u("/contact", 0.3), u("/privacy", 0.2), u("/terms", 0.2), u("/disclaimer", 0.2)];
  for (const p of PROJECTS) {
    out.push(u(`/${p.slug}`, 0.9));
    p.variants.forEach((v) => out.push(u(`/${p.slug}/${v.slug}`, 0.7)));
    COMPARISONS[p.key].forEach(([a, b]) => out.push(u(`/${p.slug}/compare/${comparisonSlug(a, b)}`, 0.7)));
    if (isIndexable("state", p)) STATES.forEach((s) => out.push(u(`/${p.slug}/${s.slug}`, 0.6)));
    if (isIndexable("city", p)) METROS.forEach((m) => out.push(u(`/${p.slug}/${STATES.find((s) => s.code === m.state)!.slug}/${m.slug}`, 0.5)));
  }
  GUIDES.forEach((g) => out.push({ url: `${SITE.url}/guides/${g.slug}`, lastModified: new Date(g.updated), priority: 0.6 }));
  return out;
}
