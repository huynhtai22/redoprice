import { DATA_UPDATED, datasetsFor } from "./data";
import { bylineFor, personSchema } from "./people";
import { SITE } from "./site";

/**
 * WebPage / Article JSON-LD with author, reviewer (only a real, published one), modified date
 * and the public datasets cited on the page.
 */
export function pageSchema(o: { title: string; description: string; path: string; projectKey?: string; type?: "WebPage" | "Article"; modified?: string; published?: string }) {
  const { author, reviewer } = bylineFor(o.projectKey);
  const citations = datasetsFor(o.projectKey).flatMap((d) => d.refs ?? []).map((r) => ({
    "@type": "CreativeWork", name: r.label, url: r.url, publisher: { "@type": "Organization", name: r.publisher.replace(/ \(via FRED\)$/, "") },
  }));
  const modified = o.modified ?? DATA_UPDATED;
  return {
    "@context": "https://schema.org",
    "@type": o.type ?? "WebPage",
    ...(o.type === "Article" ? { headline: o.title } : { name: o.title }),
    description: o.description,
    url: `${SITE.url}${o.path}`,
    dateModified: modified,
    ...(o.published ? { datePublished: o.published } : {}),
    ...(o.type === "Article" ? { author: personSchema(author) } : { author: personSchema(author) }),
    ...(reviewer ? { reviewedBy: personSchema(reviewer), lastReviewed: modified } : {}),
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    ...(citations.length ? { citation: citations } : {}),
  };
}
