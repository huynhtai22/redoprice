import Link from "next/link";
import { AUTHOR, REVIEWER } from "@/lib/editorial";
import { DATA_IS_ESTIMATE, DATA_UPDATED } from "@/lib/data";

const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

/** Author, reviewer, date and method in one quiet line under a headline. */
export default function Byline({ updated = DATA_UPDATED }: { updated?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13.5px] text-ink-2">
      <span>By <Link href={AUTHOR.href ?? "/about"} className="font-semibold text-ink hover:underline">{AUTHOR.name}</Link></span>
      {REVIEWER && <span>Reviewed by <span className="font-semibold text-ink">{REVIEWER.name}</span>, {REVIEWER.role}</span>}
      <span>Updated <time dateTime={updated}>{fmt(updated)}</time></span>
      <Link href="/how-we-calculate" className="link">How we calculate</Link>
      {DATA_IS_ESTIMATE && <span className="rounded-sm bg-warn-50 px-1.5 py-0.5 text-[12px] font-medium text-warn">Modeled estimates</span>}
    </div>
  );
}
