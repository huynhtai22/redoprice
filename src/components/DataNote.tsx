import Link from "next/link";
import { DATA_UPDATED, DATA_VERSION, datasetsFor } from "@/lib/data";
import { bylineFor, personUrl } from "@/lib/people";
import { longDate } from "@/lib/format";

/**
 * "Title block" shown under the H1 of every cost page, styled like the corner block on a
 * construction drawing: who drew it, who checked it, which data release, when.
 */
export default function DataNote({ projectKey, extra }: { projectKey?: string; extra?: string }) {
  const { author, reviewer, openReviewer } = bylineFor(projectKey);
  const sets = datasetsFor(projectKey);
  const publicCount = sets.filter((d) => d.status === "sourced" || d.status === "partial" || d.status === "verified").length;
  const cell = "flex min-w-0 flex-col gap-0.5 border-line px-3 py-2";
  const k = "font-mono text-[10px] uppercase tracking-[.14em] text-mute";
  return (
    <div className="title-block grid grid-cols-2 border border-ink bg-paper/70 text-[13px] sm:grid-cols-[1.3fr_1.3fr_1fr_1fr_auto]">
      <div className={`${cell} border-b sm:border-b-0 sm:border-r`}>
        <span className={k}>Prepared by</span>
        <Link href={personUrl(author)} className="truncate font-semibold hover:text-accent-700 hover:underline">{author.name}</Link>
      </div>
      <div className={`${cell} border-b border-l sm:border-b-0 sm:border-l-0 sm:border-r`}>
        <span className={k}>Checked by</span>
        {reviewer
          ? <Link href={personUrl(reviewer)} className="truncate font-semibold hover:text-accent-700 hover:underline">{reviewer.name}</Link>
          : <Link href={openReviewer ? personUrl(openReviewer) : "/authors"} className="truncate italic text-ink-2 hover:underline" title="We have not hired a trade reviewer for this page yet">Trade review pending</Link>}
      </div>
      <div className={`${cell} border-b sm:border-b-0 sm:border-r`}>
        <span className={k}>Updated</span>
        <time dateTime={DATA_UPDATED} className="font-mono tnum">{longDate(DATA_UPDATED)}</time>
      </div>
      <div className={`${cell} border-b border-l sm:border-b-0 sm:border-l-0 sm:border-r`}>
        <span className={k}>Data rel.</span>
        <span className="font-mono tnum">{DATA_VERSION}</span>
      </div>
      <a href={projectKey ? "#sources" : "/how-we-calculate#sources"} className={`${cell} col-span-2 flex-row items-center justify-between gap-3 bg-ink text-paper hover:bg-blue sm:col-span-1 sm:flex-col sm:items-start sm:justify-center`}>
        <span className={`${k} !text-paper/60`}>Sources</span>
        <span className="font-semibold">{sets.length} datasets{publicCount ? `, ${publicCount} public` : ""} ↓</span>
      </a>
      {extra && <p className="col-span-full border-t border-line px-3 py-1.5 text-[12px] text-mute">{extra}</p>}
    </div>
  );
}
