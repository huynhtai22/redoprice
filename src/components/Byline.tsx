import Link from "next/link";
import { bylineFor, personUrl } from "@/lib/people";
import { DATA_IS_ESTIMATE, DATA_UPDATED, datasetsFor } from "@/lib/data";
import { longDate } from "@/lib/format";

/**
 * Author, reviewer, date and sources in one quiet line under a headline.
 * The reviewer is only named once a real, published profile exists (see src/lib/people.ts);
 * until then the line says the trade review is pending and links to the open role.
 */
export default function Byline({ projectKey, updated = DATA_UPDATED, sourcesHref }: { projectKey?: string; updated?: string; sourcesHref?: string }) {
  const { author, reviewer, openReviewer } = bylineFor(projectKey);
  const n = datasetsFor(projectKey).length;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13.5px] text-ink-2">
      <span>By <Link href={personUrl(author)} className="font-semibold text-ink hover:underline">{author.name}</Link></span>
      {reviewer
        ? <span>Reviewed by <Link href={personUrl(reviewer)} className="font-semibold text-ink hover:underline">{reviewer.name}</Link>, {reviewer.role.replace(/^Expert reviewer, /i, "")}</span>
        : openReviewer && <Link href={personUrl(openReviewer)} className="text-mute hover:text-ink hover:underline" title="We have not signed a licensed trade reviewer for this topic yet">Trade review pending</Link>}
      <span>Updated <time dateTime={updated}>{longDate(updated)}</time></span>
      <Link href={sourcesHref ?? "/how-we-calculate"} className="link">{sourcesHref ? `${n} sources` : "How we calculate"}</Link>
      {DATA_IS_ESTIMATE && <span className="rounded-sm bg-warn-50 px-1.5 py-0.5 text-[12px] font-medium text-warn">Partly modeled</span>}
    </div>
  );
}
