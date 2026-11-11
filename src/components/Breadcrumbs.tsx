import Link from "next/link";
import JsonLd from "./JsonLd";
import { SITE } from "@/lib/site";

export default function Breadcrumbs({ items }: { items: { href: string; label: string }[] }) {
  const all = [{ href: "/", label: "Home" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-mute">
      <ol className="flex flex-wrap items-center gap-1">
        {all.map((c, i) => (
          <li key={c.href} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden>/</span>}
            {i < all.length - 1 ? <Link href={c.href} className="hover:text-ink">{c.label}</Link> : <span className="text-ink-2">{c.label}</span>}
          </li>
        ))}
      </ol>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: `${SITE.url}${c.href === "/" ? "" : c.href}` })) }} />
    </nav>
  );
}
