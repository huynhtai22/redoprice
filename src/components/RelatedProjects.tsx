import Link from "next/link";
import Icon from "./Icons";
import { PROJECTS } from "@/lib/projects";

/** "Planning more than one project?" grid. Drives pages per session. */
export default function RelatedProjects({ exclude, stateSlug, title = "Price your next project" }: { exclude?: string; stateSlug?: string; title?: string }) {
  const list = PROJECTS.filter((p) => p.slug !== exclude);
  return (
    <section>
      <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p) => (
          <Link key={p.slug} href={stateSlug ? `/${p.slug}/${stateSlug}` : `/${p.slug}`} className="card group p-4 transition hover:border-ink/25 hover:shadow-sm">
            <Icon name={p.icon} className="h-6 w-6 text-accent-600" />
            <p className="mt-2 font-semibold">{p.calculatorName}</p>
            <p className="mt-1 text-sm text-ink-2">{p.short}</p>
            <p className="mt-2 text-sm font-semibold text-accent-700 group-hover:underline">Estimate now →</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
