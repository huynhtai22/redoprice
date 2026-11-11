import Link from "next/link";
import { MIN_SAMPLE, quotesForArea } from "@/lib/communityQuotes";
import { formatUSD } from "@/lib/format";

type Props = { projectKey: string; projectNoun: string; zip?: string; stateCode?: string; quote?: number; placeLabel?: string };

/**
 * Moderated, anonymized quotes from homeowners in the same area. Renders on server or client.
 * Below the minimum sample it shows nothing but a count and an invitation to share.
 */
export default function AreaQuotes({ projectKey, projectNoun, zip, stateCode, quote, placeLabel }: Props) {
  const a = quotesForArea(projectKey, { zip, stateCode });
  const share = <Link href={`/share-your-quote?project=${projectKey}`} className="link">Share yours anonymously</Link>;

  return (
    <section aria-labelledby={`aq-${projectKey}`}>
      <h3 id={`aq-${projectKey}`} className="font-display text-xl font-bold">
        Real {projectNoun} quotes {a?.enough ? `in ${a.areaLabel}` : placeLabel ? `in ${placeLabel}` : "from your area"}
      </h3>

      {!a || !a.enough ? (
        <p className="mt-2 max-w-3xl border-t border-line pt-3 text-[15px] leading-relaxed text-ink-2">
          {a && a.n > 0
            ? <>We have {a.n} reviewed {a.n === 1 ? "quote" : "quotes"} for {a.areaLabel} so far. We publish an area once it has at least {MIN_SAMPLE}, so no single homeowner&apos;s price can be picked out. </>
            : <>No reviewed quotes for this area yet. We publish real quotes only once an area has at least {MIN_SAMPLE}, so no single homeowner&apos;s price can be picked out. </>}
          {share}. No name, no email, no address.
        </p>
      ) : (
        <>
          <p className="mt-1 text-[15px] text-ink-2">
            {a.n} reviewed quotes shared by homeowners. The middle half paid <strong className="tnum text-ink">{formatUSD(a.stats!.p25)} to {formatUSD(a.stats!.p75)}</strong>; the median was <strong className="tnum text-ink">{formatUSD(a.stats!.median)}</strong>.
            {quote ? <> Your quote is {quote > a.stats!.p75 ? "above" : quote < a.stats!.p25 ? "below" : "inside"} that band.</> : null}
          </p>
          <table className="mt-3 w-full border-t border-ink text-[15px]">
            <thead><tr className="text-left text-[13px] text-mute"><th className="py-2 font-medium">Quoted</th><th className="py-2 font-medium">Job</th><th className="hidden py-2 font-medium sm:table-cell">Outcome</th><th className="py-2 text-right font-medium">Month</th></tr></thead>
            <tbody>
              {a.quotes.map((q) => (
                <tr key={q.id} className="border-t border-line">
                  <td className="py-2 font-mono font-semibold tnum">{formatUSD(q.amount)}</td>
                  <td className="py-2 text-ink-2">{[q.variant, q.size].filter(Boolean).join(", ") || "–"}</td>
                  <td className="hidden py-2 text-ink-2 sm:table-cell">{q.outcome ?? "–"}</td>
                  <td className="py-2 text-right text-ink-2">{q.month}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[13px] text-mute">Each quote is reviewed before it appears. Amounts are rounded, locations are shown only as a 3-digit ZIP area or state, and we never collect names or contact details. {share}.</p>
        </>
      )}
    </section>
  );
}
