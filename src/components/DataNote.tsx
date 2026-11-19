import Link from "next/link";
import { DATA_IS_ESTIMATE, DATA_UPDATED } from "@/lib/data";

/** Source + updated line shown on every cost page. */
export default function DataNote({ extra }: { extra?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-ink-2">
      <span>Updated <time dateTime={DATA_UPDATED}>{new Date(DATA_UPDATED + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time></span>
      {DATA_IS_ESTIMATE && <><span aria-hidden>·</span><span>Built from 2026 public wage and material data</span></>}
      <span aria-hidden>·</span>
      <Link href="/how-we-calculate" className="link inline-flex min-h-[32px] items-center">How we calculate</Link>
      {extra && <><span aria-hidden>·</span><span>{extra}</span></>}
    </div>
  );
}
