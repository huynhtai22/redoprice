import type { Project } from "@/lib/engine";
import type { MetroRow, StateRow } from "@/lib/data";
import { SITE } from "@/lib/site";
import AreaQuotes from "./AreaQuotes";

type Props = { p: Project; state?: StateRow; metro?: MetroRow };

/** Under each cost page: moderated real quotes for the area, and the shareable cost sheet. */
export default function CostExtras({ p, state, metro }: Props) {
  const path = [p.slug, state?.slug, metro?.slug].filter(Boolean).join("/");
  const pageUrl = `${SITE.url}/${path}`;
  const pinUrl = `${SITE.url}/pin/${path}`;
  const place = metro ? `${metro.name}, ${state!.code}` : state?.name;
  const desc = `What ${p.noun === "solar" ? "solar panels cost" : `a new ${p.noun} costs`}${place ? ` in ${place}` : ""}: typical price, fair range and the cost breakdown. Check any quote free.`;
  const pinterest = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}&media=${encodeURIComponent(pinUrl)}&description=${encodeURIComponent(desc)}`;

  return (
    <div className="space-y-12">
      <AreaQuotes projectKey={p.key} projectNoun={p.noun} stateCode={state?.code} placeLabel={place} />
      <section className="grid gap-5 border-t border-ink pt-5 sm:grid-cols-[160px_1fr] sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/pin/${path}`} alt={`Cost sheet for ${p.name.toLowerCase()}${place ? ` in ${place}` : ""}`} width={160} height={240} loading="lazy" className="hidden border border-line bg-white sm:block" />
        <div>
          <h3 className="font-display text-xl font-bold">Save this cost sheet</h3>
          <p className="mt-1 max-w-xl text-[15px] text-ink-2">One page with the typical price{place ? ` in ${place}` : ""}, the fair range and the cost by {p.variantNoun}. Pin it, or keep it on your phone for when the contractor visits.</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
            <a href={pinterest} target="_blank" rel="noopener noreferrer" className="link font-semibold">Save to Pinterest</a>
            <a href={`/pin/${path}`} download={`${path.replace(/\//g, "-")}-cost.png`} className="link">Download image</a>
          </div>
        </div>
      </section>
    </div>
  );
}
