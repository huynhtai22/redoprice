import Link from "next/link";
import { DATA_IS_ESTIMATE, DATA_UPDATED, DATA_VERSION } from "@/lib/data";

/** Source + updated line shown on every cost page. */
export default function DataNote({ extra }: { extra?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-mute">
      <span>Updated <time dateTime={DATA_UPDATED}>{new Date(DATA_UPDATED + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time></span>
      <span aria-hidden>·</span>
      <span>Data release {DATA_VERSION}</span>
      {DATA_IS_ESTIMATE && <><span aria-hidden>·</span><span className="rounded bg-warn-50 px-1.5 py-0.5 font-semibold text-warn">Modeled estimates</span></>}
      <span aria-hidden>·</span>
      <Link href="/how-we-calculate" className="underline underline-offset-2">Sources & method</Link>
      {extra && <><span aria-hidden>·</span><span>{extra}</span></>}
    </div>
  );
}
