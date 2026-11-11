import Link from "next/link";
import { DATA_IS_ESTIMATE, DATA_UPDATED, DATA_VERSION, datasetsFor } from "@/lib/data";
import { longDate } from "@/lib/format";

/** Source + updated line for pages without a full byline. Links to the page's Sources section when it has one. */
export default function DataNote({ projectKey, extra }: { projectKey?: string; extra?: string }) {
  const n = datasetsFor(projectKey).length;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-mute">
      <span>Updated <time dateTime={DATA_UPDATED}>{longDate(DATA_UPDATED)}</time></span>
      <span aria-hidden>·</span>
      <span className="tnum">Data release {DATA_VERSION}</span>
      {DATA_IS_ESTIMATE && <><span aria-hidden>·</span><span className="rounded-sm bg-warn-50 px-1.5 py-0.5 font-medium text-warn">Partly modeled</span></>}
      <span aria-hidden>·</span>
      <Link href={projectKey ? "#sources" : "/how-we-calculate#sources"} className="link">{n} sources & method</Link>
      {extra && <><span aria-hidden>·</span><span>{extra}</span></>}
    </div>
  );
}
