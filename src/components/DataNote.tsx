import Link from "next/link";
import { DATA_IS_ESTIMATE, DATA_UPDATED, DATA_VERSION } from "@/lib/data";

/** Source + updated line shown on every cost page. */
export default function DataNote({ extra }: { extra?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-mute">
      <span>Updated <time dateTime={DATA_UPDATED}>{new Date(DATA_UPDATED + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time></span>
      <span aria-hidden>·</span>
      <span>Data release {DATA_VERSION}</span>
      {DATA_IS_ESTIMATE && <><span aria-hidden>·</span><span className="border border-warn/40 px-1.5 py-0.5 text-warn">Modeled estimates</span></>}
      <span aria-hidden>·</span>
      <Link href="/how-we-calculate" className="link">Sources & method</Link>
      {extra && <><span aria-hidden>·</span><span>{extra}</span></>}
    </div>
  );
}
