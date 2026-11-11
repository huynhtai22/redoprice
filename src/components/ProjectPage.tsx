import Link from "next/link";
import Calculator from "./Calculator";
import AdSlot from "./AdSlot";
import Breadcrumbs from "./Breadcrumbs";
import Byline from "./Byline";
import Photo from "./Photo";
import RangeChart from "./RangeChart";
import FAQ from "./FAQ";
import RelatedProjects from "./RelatedProjects";
import ContractorChecklist from "./ContractorChecklist";
import LeadForm from "./LeadForm";
import JsonLd from "./JsonLd";
import SourcesLedger from "./SourcesLedger";
import { pageSchema } from "@/lib/schema";
import { COMPARISONS, RESALE, comparisonSlug, getVariant } from "@/lib/projects";
import { METROS, NATIONAL, NATIONAL_REGION, STATES, metrosInState, regionFor, type MetroRow, type StateRow } from "@/lib/data";
import type { Project, Variant } from "@/lib/engine";
import { formatUSD, pct, roundMoney } from "@/lib/format";
import { GUIDES } from "@/lib/guides";
import { SITE } from "@/lib/site";

const CLIMATE: Record<string, string> = {
  hail: "Hail is common here. Impact-rated (Class 4) materials cost more but can lower insurance premiums and survive storms better.",
  hurricane: "Hurricane and high-wind codes apply in much of the state. Expect stricter fastening, sealed decks and higher-rated products, which add to labor and materials.",
  snow: "Snow loads and ice dams matter. Ice-and-water shield, better ventilation and heating capacity raise costs compared with mild climates.",
  heat: "Long, hot summers favor reflective roofing, efficient cooling and heat-tolerant materials.",
  wildfire: "Wildfire zones may require Class A fire-rated roofing and non-combustible fencing near the home.",
};

type Props = { p: Project; state?: StateRow; metro?: MetroRow; variant?: Variant; noindexNote?: boolean };

export default function ProjectPage({ p, state, metro, variant }: Props) {
  const region = state ? regionFor(state, metro) : NATIONAL_REGION;
  const place = metro ? `${metro.name}, ${state!.code}` : state?.name;
  const defaults = p.defaults(region);
  const preset = variant ? variant.preset ?? { [p.variantKey]: variant.value } : undefined;
  const typicalJob = p.compute({ ...defaults, ...preset }, region);
  const national = p.compute(p.defaults(NATIONAL_REGION), NATIONAL_REGION);
  const nationalJob = p.compute({ ...p.defaults(NATIONAL_REGION), ...preset }, NATIONAL_REGION);

  const title = variant
    ? `${variant.label} cost${place ? ` in ${place}` : ""}`
    : place ? `${p.name} cost in ${place}` : p.calculatorName;

  const crumbs = [{ href: `/${p.slug}`, label: p.name }];
  if (variant) crumbs.push({ href: `/${p.slug}/${variant.slug}`, label: variant.label });
  if (state) crumbs.push({ href: `/${p.slug}/${state.slug}`, label: state.name });
  if (metro) crumbs.push({ href: `/${p.slug}/${state!.slug}/${metro.slug}`, label: metro.name });

  const table = p.variants.map((v) => {
    const e = p.compute({ ...defaults, ...(v.preset ?? { [p.variantKey]: v.value }) }, region);
    return { v, e };
  });

  const resale = RESALE[p.key];
  const guides = GUIDES.filter((g) => p.relatedGuides.includes(g.slug));
  const comps = COMPARISONS[p.key];
  const metros = state ? metrosInState(state.code).filter((m) => m.slug !== metro?.slug) : METROS.slice(0, 12);
  const permit = (NATIONAL[p.key] as { permit: number[] }).permit;

  return (
    <>
      <div className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-7 pt-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div className="min-w-0">
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-3 max-w-4xl font-display text-[2.1rem] font-bold leading-tight tracking-[-0.015em] sm:text-[2.9rem]">{title}</h1>
            <p className="mt-3 max-w-3xl text-lg leading-relaxed text-ink-2">
              {place
                ? <>A typical {variant ? variant.label.toLowerCase() : p.noun} job in {place} runs about <strong className="text-ink tnum">{formatUSD(roundMoney(typicalJob.low))} to {formatUSD(roundMoney(typicalJob.high))}</strong>. Adjust the inputs below for your home.</>
                : variant ? <>{variant.blurb} Typical cost: <strong className="text-ink tnum">{formatUSD(roundMoney(typicalJob.low))} to {formatUSD(roundMoney(typicalJob.high))}</strong> (US average).</>
                : p.intro}
            </p>
            <div className="mt-4"><Byline projectKey={p.key} sourcesHref="#sources" /></div>
          </div>
          <Photo name={p.key} priority ratio="3 / 2" sizes="320px" className="hidden lg:block" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-6">
        <Calculator projectSlug={p.slug} stateCode={state?.code} metroSlug={metro?.slug} preset={preset} />
      </div>

      {/* Ad: below the calculator + result, never beside inputs */}
      <div className="mx-auto mt-8 max-w-6xl px-4"><AdSlot placement="afterResult" /></div>

      <div className="mx-auto mt-8 grid max-w-6xl gap-10 px-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-12">
          {/* Local cost table (unique per page: computed from this region's data) */}
          <section>
            <h2 className="font-display text-[1.75rem] font-bold tracking-tight">{p.name} cost by {p.variantNoun}{place ? ` in ${place}` : ""}</h2>
            <p className="mt-1 text-sm text-ink-2">For a typical home{place ? ` in ${place}` : ""}, using the default inputs above. Lifetime cost divides the typical price by expected years of life.</p>
            <div className="mt-5"><RangeChart rows={table.map(({ v, e }) => ({ label: v.label, href: `/${p.slug}/${v.slug}`, low: e.low, typical: e.typical, high: e.high, highlight: variant?.slug === v.slug }))} /></div>
            <div className="mt-6 overflow-x-auto border-t-2 border-ink">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="border-b border-line text-left text-[12px] font-semibold uppercase tracking-wider text-mute">
                  <tr><th className="px-4 py-3 capitalize">{p.variantNoun}</th><th className="px-4 py-3">Low</th><th className="px-4 py-3">Typical</th><th className="px-4 py-3">High</th><th className="px-4 py-3">Per year of life</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {table.map(({ v, e }) => (
                    <tr key={v.slug} className={variant?.slug === v.slug ? "bg-accent-50/60" : ""}>
                      <td className="px-4 py-3 font-semibold"><Link href={`/${p.slug}/${v.slug}`} className="hover:text-accent-600 hover:underline">{v.label}</Link></td>
                      <td className="px-4 py-3 tnum tnum">{formatUSD(roundMoney(e.low))}</td>
                      <td className="px-4 py-3 tnum font-semibold tnum">{formatUSD(roundMoney(e.typical))}</td>
                      <td className="px-4 py-3 tnum tnum">{formatUSD(roundMoney(e.high))}</td>
                      <td className="px-4 py-3 tnum tnum text-ink-2">{e.lifespanYears ? formatUSD(e.typical / e.lifespanYears) : "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {state && (
            <section className="rounded-md bg-paper p-5 sm:p-7">
              <p className="label">Local conditions</p>
              <h2 className="mt-1 font-display text-[1.6rem] font-bold">What drives the price in {place}</h2>
              <div className="mt-5"><RangeChart rows={[
                { label: place!, low: typicalJob.low, typical: typicalJob.typical, high: typicalJob.high, highlight: true },
                ...(metro ? [(() => { const e = p.compute({ ...p.defaults(regionFor(state)), ...preset }, regionFor(state)); return { label: `${state.name} average`, low: e.low, typical: e.typical, high: e.high }; })()] : []),
                { label: "United States", low: nationalJob.low, typical: nationalJob.typical, high: nationalJob.high },
              ]} /></div>
              <ul className="mt-6 space-y-3 text-ink-2">
                <li><strong className="text-ink">Labor:</strong> construction labor here is {Math.abs(region.laborIndex - 1) < 0.02 ? "close to" : <><strong className="tnum">{pct(region.laborIndex - 1)}</strong> {region.laborIndex > 1 ? "above" : "below"}</>} the US average.</li>
                <li><strong className="text-ink">Materials:</strong> delivered material prices run {Math.abs(region.materialIndex - 1) < 0.02 ? "close to" : <><strong className="tnum">{pct(region.materialIndex - 1)}</strong> {region.materialIndex > 1 ? "above" : "below"}</>} the national average.</li>
                <li><strong className="text-ink">Compared with the US:</strong> the typical {p.noun} job is {formatUSD(roundMoney(typicalJob.typical))} here vs {formatUSD(roundMoney(national.typical))} nationally ({pct(typicalJob.typical / national.typical - 1)}).</li>
                <li><strong className="text-ink">Permits:</strong> expect roughly {formatUSD(permit[0] * region.laborIndex)} to {formatUSD(permit[2] * region.laborIndex)}, set by your city or county.</li>
                {state.climate.map((c) => CLIMATE[c] && <li key={c}><strong className="text-ink">Climate:</strong> {CLIMATE[c]}</li>)}
              </ul>
            </section>
          )}

          {variant && (
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="border-t-2 border-good pt-3"><h2 className="label !text-good">In its favor</h2><ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink-2">{variant.pros.map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div className="border-t-2 border-bad pt-3"><h2 className="label !text-bad">Against it</h2><ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink-2">{variant.cons.map((x) => <li key={x}>{x}</li>)}</ul></div>
            </section>
          )}

          <section>
            <h2 className="font-display text-[1.75rem] font-bold tracking-tight">What moves the price of a {p.noun}</h2>
            <ol className="mt-4 border-t border-line">
              {p.costFactors.map((f, i) => (
                <li key={f.title} className="grid grid-cols-[2.25rem_1fr] gap-2 border-b border-line py-4">
                  <span className="text-sm font-semibold text-mute tnum">{i + 1}.</span>
                  <div><h3 className="font-semibold">{f.title}</h3><p className="mt-1 leading-relaxed text-ink-2">{f.body}</p></div>
                </li>
              ))}
            </ol>
          </section>

          <AdSlot placement="midContent" />

          {comps.length > 0 && (
            <section>
              <h2 className="font-display text-[1.75rem] font-bold tracking-tight">Head to head</h2>
              <ul className="mt-3 border-t border-line">
                {comps.map(([a, b]) => (
                  <li key={a + b} className="border-b border-line">
                    <Link href={`/${p.slug}/compare/${comparisonSlug(a, b)}`} className="group flex items-baseline justify-between gap-3 py-3">
                      <span><span className="font-semibold">{getVariant(p, a)!.label}</span> <span className="text-mute">vs</span> <span className="font-semibold">{getVariant(p, b)!.label}</span></span>
                      <span aria-hidden className="text-mute group-hover:text-accent-600">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="border-l-[3px] border-accent-500 pl-5">
            <p className="label">Selling soon?</p>
            <h2 className="mt-1 font-display text-[1.6rem] font-bold">Does a new {p.noun} pay you back at sale?</h2>
            <p className="mt-2 text-ink-2">
              Homeowners typically recoup an estimated <strong className="text-ink">{Math.round(resale.recoupLow * 100)}% to {Math.round(resale.recoupHigh * 100)}%</strong> of the cost at sale,
              or about <strong className="text-ink tnum">{formatUSD(roundMoney(typicalJob.typical * resale.recoupLow))} to {formatUSD(roundMoney(typicalJob.typical * resale.recoupHigh))}</strong> on this job. {resale.note}
            </p>
            <p className="mt-2 text-xs text-mute">Estimated range from general market patterns; resale value depends heavily on your local market and the home&apos;s overall condition.</p>
          </section>

          <SourcesLedger projectKey={p.key} place={place} />

          <FAQ faqs={p.faqs} />

          <ContractorChecklist noun={p.quoteNoun.replace(/s$/, "")} />

          {guides.length > 0 && (
            <section>
              <h2 className="font-display text-[1.75rem] font-bold tracking-tight">Read this before you sign</h2>
              <div className="mt-3 border-t border-line">
                {guides.map((g) => (
                  <Link key={g.slug} href={`/guides/${g.slug}`} className="group block border-b border-line py-4">
                    <p className="label">{g.kicker}</p>
                    <p className="mt-1 font-display text-[1.25rem] font-semibold group-hover:underline group-hover:underline-offset-4">{g.title}</p>
                    <p className="mt-1 text-[15px] text-ink-2">{g.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <LeadForm projectKey={p.key} projectName={p.name} quoteNoun={p.quoteNoun} place={place} />

          <p className="text-[15px] text-ink-2">Already paid for one? <Link href={`/share-your-quote?project=${p.key}`} className="link">Tell us what it cost</Link>. No name, no email, and it keeps these numbers honest for your neighbors.</p>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-6">
            <AdSlot placement="sidebar" />
          </div>
        </aside>
      </div>

      <div className="mx-auto mt-12 max-w-6xl space-y-12 px-4">
        <section id="states" className="scroll-mt-20">
          <h2 className="font-display text-[1.75rem] font-bold tracking-tight">{state ? (metro ? `Other cities in ${state.name}` : `${p.name} cost in ${state.name} cities`) : `${p.name} cost by state`}</h2>
          <div className="mt-4 columns-2 gap-6 border-t border-line pt-3 text-[15px] sm:columns-3 lg:columns-5">
            {(state ? metros : STATES).map((x) => {
              const href = state ? `/${p.slug}/${state.slug}/${(x as MetroRow).slug}` : `/${p.slug}/${(x as StateRow).slug}`;
              return <Link key={href} href={href} className="block break-inside-avoid py-1 hover:text-accent-600 hover:underline">{x.name}</Link>;
            })}
            {state && metros.length === 0 && <span className="block text-ink-2">No city pages for {state.name} yet. The state figures above apply.</span>}
            {state && <Link href={`/${p.slug}#states`} className="link block py-1">All states</Link>}
          </div>
        </section>
        <RelatedProjects exclude={p.slug} stateSlug={state?.slug} title={state ? `More project costs in ${state.name}` : "Price your next project"} />
        <AdSlot placement="beforeFooter" />
      </div>

      <JsonLd data={pageSchema({ title, description: `${p.calculatorName}${place ? ` for ${place}` : ""}: typical cost ${formatUSD(roundMoney(typicalJob.low))} to ${formatUSD(roundMoney(typicalJob.high))}.`, path: crumbs.at(-1)!.href, projectKey: p.key })} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "WebApplication", name: `${p.calculatorName}${place ? ` – ${place}` : ""}`,
        applicationCategory: "UtilitiesApplication", operatingSystem: "Any", url: SITE.url, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      }} />
    </>
  );
}
