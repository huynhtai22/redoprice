import Link from "next/link";
import { AUTHOR, REVIEWER } from "@/lib/editorial";
import { DATA_IS_ESTIMATE, DATA_UPDATED } from "@/lib/data";

const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

/** Author, reviewer, date and method in one quiet line under a headline. */
export default function Byline({ updated = DATA_UPDATED }: { updated?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[15px] text-ink-2">
      <span>By <Link href={AUTHOR.href ?? "/about"} className="inline-flex min-h-[32px] items-center font-semibold text-ink hover:underline">{AUTHOR.name}</Link></span>
      {REVIEWER && <span>Reviewed by <span className="font-semibold text-ink">{REVIEWER.name}</span>, {REVIEWER.role}</span>}
      <span>Updated <time dateTime={updated}>{fmt(updated)}</time></span>
      {DATA_IS_ESTIMATE && <span>Built from 2026 public wage and material data</span>}
      <Link href="/how-we-calculate" className="link inline-flex min-h-[32px] items-center">How we calculate</Link>
    </div>
  );
}
