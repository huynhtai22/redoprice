import Link from "next/link";
import Photo from "./Photo";
import { PROJECTS, getProject } from "@/lib/projects";

/** "Next job on the list" ledger. Drives pages per session. */
export default function RelatedProjects({ exclude, stateSlug, title = "Next job on the list" }: { exclude?: string; stateSlug?: string; title?: string }) {
  // Same part of the house first (a roof page suggests gutters and siding), six at most.
  const self = exclude ? getProject(exclude) : undefined;
  const others = PROJECTS.filter((p) => p.slug !== exclude);
  const list = (self ? [...others.filter((p) => p.group === self.group), ...others.filter((p) => p.group !== self.group)] : others).slice(0, 6);
  return (
    <section>
      <h2 className="font-display text-[1.75rem] font-bold tracking-tight">{title}</h2>
      <div className="mt-4 grid border-t border-ink sm:grid-cols-2">
        {list.map((p, i) => (
          <Link key={p.slug} href={stateSlug ? `/${p.slug}/${stateSlug}` : `/${p.slug}`}
            className={`group flex items-center gap-4 border-b border-line py-4 ${i % 2 ? "sm:border-l sm:pl-6" : "sm:pr-6"}`}>
            <Photo name={p.key} ratio="4 / 3" sizes="96px" credit={false} className="w-20 shrink-0" />
            <span className="min-w-0">
              <span className="block text-[17px] font-semibold group-hover:underline group-hover:underline-offset-4">{p.calculatorName.replace(" Calculator", "")}</span>
              <span className="block text-[15px] text-ink-2">{p.short}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
