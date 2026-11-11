import Link from "next/link";
import Sketch from "./Sketch";
import { PROJECTS } from "@/lib/projects";

/** "Next job on the list" ledger. Drives pages per session. */
export default function RelatedProjects({ exclude, stateSlug, title = "Next job on the list" }: { exclude?: string; stateSlug?: string; title?: string }) {
  const list = PROJECTS.filter((p) => p.slug !== exclude);
  return (
    <section>
      <h2 className="font-display text-[1.75rem] font-bold tracking-tight">{title}</h2>
      <div className="mt-4 grid border-t border-ink sm:grid-cols-2">
        {list.map((p, i) => (
          <Link key={p.slug} href={stateSlug ? `/${p.slug}/${stateSlug}` : `/${p.slug}`}
            className={`group flex items-center gap-4 border-b border-line py-4 ${i % 2 ? "sm:border-l sm:pl-6" : "sm:pr-6"}`}>
            <Sketch name={p.key} className="h-11 w-14 shrink-0 text-blue" />
            <span className="min-w-0">
              <span className="block font-display text-lg font-semibold group-hover:underline group-hover:underline-offset-4">{p.calculatorName.replace(" Calculator", "")}</span>
              <span className="block text-[15px] text-ink-2">{p.short}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
