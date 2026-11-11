import Link from "next/link";
import { bylineFor, personUrl } from "@/lib/people";
import { longDate } from "@/lib/format";

/** Article byline: author, reviewer (only a real one), updated date. */
export default function Byline({ projectKey, updated }: { projectKey?: string; updated: string }) {
  const { author, reviewer } = bylineFor(projectKey);
  return (
    <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-y border-line py-2 text-[14px] text-ink-2">
      <span>By <Link href={personUrl(author)} className="font-semibold text-ink hover:underline">{author.name}</Link></span>
      {reviewer && <><span aria-hidden className="text-line-2">/</span><span>Checked by <Link href={personUrl(reviewer)} className="font-semibold text-ink hover:underline">{reviewer.name}</Link>, {reviewer.role.replace(/^Expert reviewer, /i, "")}</span></>}
      <span aria-hidden className="text-line-2">/</span>
      <span>Updated <time dateTime={updated} className="font-mono text-[13px] tnum">{longDate(updated)}</time></span>
      <span aria-hidden className="text-line-2">/</span>
      <Link href="/how-we-calculate#editorial" className="link text-[13px]">Editorial standards</Link>
    </p>
  );
}
