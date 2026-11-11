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
import Chapter, { type ChapterRef } from "./Chapter";
import OnThisPage from "./OnThisPage";
import TrustStrip from "./TrustStrip";
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
  const placeShort = metro ? metro.name : state?.name;
  const chapters: ChapterRef[] = [
    { id: "estimate", short: "Your estimate" },
    { id: "compare", short: `By ${p.variantNoun}` },
    ...(state ? [{ id: "local", short: `Prices in ${placeShort}` }] : []),
    { id: "factors", short: "What changes the price" },
    { id: "hire", short: "Before you hire" },
    { id: "faq", short: "Questions" },
  ];

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
                : <>Most US homeowners pay <strong className="text-ink tnum">{formatUSD(roundMoney(typicalJob.low))} to {formatUSD(roundMoney(typicalJob.high))}</strong> for a typical {p.noun} job, about {formatUSD(roundMoney(typicalJob.typical))} in the middle. {p.intro}</>}
            </p>
            <div className="mt-4"><Byline /></div>
          </div>
          <Photo name={p.key} priority ratio="3 / 2" sizes="320px" className="hidden lg:block" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <div className="pt-10">
          <Chapter id="estimate" n={1} total={chapters.length} short={chapters[0].short} title={`Price your ${p.noun}`}
            lead={<>Enter your ZIP code and describe the job. The price, the fair range and the math behind them update as you go.</>}>
            <Calculator projectSlug={p.slug} stateCode={state?.code} metroSlug={metro?.slug} preset={preset} />
            <div className="mt-10"><TrustStrip /></div>
          </Chapter>
        </div>

        {/* Ad: below the calculator + result, never beside inputs */}
        <AdSlot placement="afterResult" className="mb-10" />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            <Chapter id="compare" n={2} total={chapters.length} short={chapters[1].short} next={chapters[2]}
              title={`${p.name} cost by ${p.variantNoun}${place ? ` in ${place}` : ""}`}
              lead={<>Your {p.variantNoun} is the biggest choice you make. Here is the same {placeShort ? `${placeShort} ` : ""}job priced with each one, with low, typical and high quotes you should expect.</>}>
              <RangeChart rows={table.map(({ v, e }) => ({ label: v.label, href: `/${p.slug}/${v.slug}`, low: e.low, typical: e.typical, high: e.high, highlight: variant?.slug === v.slug }))} />
              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[560px] border-t-2 border-ink text-[15px]">
                  <caption className="pb-2 text-left text-[14px] text-mute">Typical home{place ? ` in ${place}` : ""}, default inputs. Per year of life divides the typical price by expected lifespan.</caption>
                  <thead className="border-b border-line text-left text-[14px] text-ink-2">
                    <tr><th className="py-3 pr-4 font-semibold capitalize">{p.variantNoun}</th><th className="py-3 pr-4 text-right font-semibold">Low</th><th className="py-3 pr-4 text-right font-semibold">Typical</th><th className="py-3 pr-4 text-right font-semibold">High</th><th className="py-3 text-right font-semibold">Per year of life</th></tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {table.map(({ v, e }) => (
                      <tr key={v.slug} className={variant?.slug === v.slug ? "bg-accent-50/60" : ""}>
                        <td className="py-3 pr-4 font-semibold"><Link href={`/${p.slug}/${v.slug}`} className="hover:text-accent-600 hover:underline">{v.label}</Link></td>
                        <td className="py-3 pr-4 text-right tnum">{formatUSD(roundMoney(e.low))}</td>
                        <td className="py-3 pr-4 text-right font-semibold tnum">{formatUSD(roundMoney(e.typical))}</td>
                        <td className="py-3 pr-4 text-right tnum">{formatUSD(roundMoney(e.high))}</td>
                        <td className="py-3 text-right tnum text-ink-2">{e.lifespanYears ? formatUSD(e.typical / e.lifespanYears) : "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {variant && (
                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                  <div><h3 className="text-[17px] font-semibold text-good">In its favor</h3><ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink-2">{variant.pros.map((x) => <li key={x}>{x}</li>)}</ul></div>
                  <div><h3 className="text-[17px] font-semibold text-bad">Against it</h3><ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink-2">{variant.cons.map((x) => <li key={x}>{x}</li>)}</ul></div>
                </div>
              )}

              {comps.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-[17px] font-semibold">Weighing two {p.variantPlural}? Head to head:</h3>
                  <ul className="mt-3 grid border-t border-line sm:grid-cols-2 sm:gap-x-8">
                    {comps.map(([a, b]) => (
                      <li key={a + b} className="border-b border-line">
                        <Link href={`/${p.slug}/compare/${comparisonSlug(a, b)}`} className="group flex min-h-[48px] items-center justify-between gap-3 py-2">
                          <span><span className="font-semibold">{getVariant(p, a)!.label}</span> <span className="text-mute">vs</span> <span className="font-semibold">{getVariant(p, b)!.label}</span></span>
                          <span aria-hidden className="text-mute group-hover:text-accent-600">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Chapter>

            {state && (
              <Chapter id="local" n={3} total={chapters.length} short={chapters[2].short} next={chapters[3]}
                title={`Why ${place} costs what it does`}
                lead={<>The same job costs more or less depending on local wages, material delivery, permits and weather. This is how {place} compares.</>}>
                <RangeChart rows={[
                  { label: place!, low: typicalJob.low, typical: typicalJob.typical, high: typicalJob.high, highlight: true },
                  ...(metro ? [(() => { const e = p.compute({ ...p.defaults(regionFor(state)), ...preset }, regionFor(state)); return { label: `${state.name} average`, low: e.low, typical: e.typical, high: e.high }; })()] : []),
                  { label: "United States", low: nationalJob.low, typical: nationalJob.typical, high: nationalJob.high },
                ]} />
                <dl className="mt-8 grid border-t border-line sm:grid-cols-2 sm:gap-x-8">
                  {[
                    ["Labor", <>Construction labor here is {Math.abs(region.laborIndex - 1) < 0.02 ? "close to" : <><strong className="text-ink tnum">{pct(region.laborIndex - 1)}</strong> {region.laborIndex > 1 ? "above" : "below"}</>} the US average.</>],
                    ["Materials", <>Delivered material prices run {Math.abs(region.materialIndex - 1) < 0.02 ? "close to" : <><strong className="text-ink tnum">{pct(region.materialIndex - 1)}</strong> {region.materialIndex > 1 ? "above" : "below"}</>} the national average.</>],
                    ["Against the US", <>The typical {p.noun} job is {formatUSD(roundMoney(typicalJob.typical))} here vs {formatUSD(roundMoney(national.typical))} nationally ({pct(typicalJob.typical / national.typical - 1)}).</>],
                    ["Permits", <>Expect roughly {formatUSD(permit[0] * region.laborIndex)} to {formatUSD(permit[2] * region.laborIndex)}, set by your city or county.</>],
                    ...state.climate.filter((c) => CLIMATE[c]).map((c) => ["Climate", CLIMATE[c]] as [string, React.ReactNode]),
                  ].map(([k, v], i) => (
                    <div key={i} className="border-b border-line py-4"><dt className="text-[15px] font-semibold">{k}</dt><dd className="mt-1 text-ink-2">{v}</dd></div>
                  ))}
                </dl>
              </Chapter>
            )}

            <Chapter id="factors" n={chapters.findIndex((c) => c.id === "factors") + 1} total={chapters.length} short="What changes the price" next={chapters[chapters.findIndex((c) => c.id === "factors") + 1]}
              title={`What changes the price of a ${p.noun}`}
              lead={<>Beyond {p.variantNoun} and location, these are the things a contractor looks at when they price your job, roughly in order of how much they matter.</>}>
              <ol className="border-t border-line">
                {p.costFactors.map((f, i) => (
                  <li key={f.title} className="grid grid-cols-[2rem_1fr] gap-2 border-b border-line py-5">
                    <span className="pt-0.5 text-[15px] font-semibold text-mute tnum">{i + 1}.</span>
                    <div><h3 className="text-[17px] font-semibold">{f.title}</h3><p className="mt-1 leading-relaxed text-ink-2">{f.body}</p></div>
                  </li>
                ))}
              </ol>
              <div className="mt-8 rounded-md bg-paper p-5 sm:p-6">
                <h3 className="text-[17px] font-semibold">Selling in the next few years?</h3>
                <p className="mt-2 text-ink-2">
                  Homeowners typically recoup an estimated <strong className="text-ink">{Math.round(resale.recoupLow * 100)}% to {Math.round(resale.recoupHigh * 100)}%</strong> of the cost at sale,
                  or about <strong className="text-ink tnum">{formatUSD(roundMoney(typicalJob.typical * resale.recoupLow))} to {formatUSD(roundMoney(typicalJob.typical * resale.recoupHigh))}</strong> on this job. {resale.note}
                </p>
                <p className="mt-2 text-[14px] text-mute">Estimated range from general market patterns; resale value depends on your local market and the home&apos;s condition.</p>
              </div>
            </Chapter>

            <AdSlot placement="midContent" className="my-6" />

            <Chapter id="hire" n={chapters.findIndex((c) => c.id === "hire") + 1} total={chapters.length} short="Before you hire" next={chapters[chapters.length - 1]}
              title="Before you hire anyone"
              lead={<>You know the fair price. Now make sure every quote is for the same job. Ask each {p.quoteNoun.replace(/s$/, "")} these questions, or print the quote-check sheet from your estimate above.</>}>
              <ContractorChecklist noun={p.quoteNoun.replace(/s$/, "")} bare />
              {guides.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-[17px] font-semibold">Worth reading before you sign</h3>
                  <ul className="mt-3 border-t border-line">
                    {guides.map((g) => (
                      <li key={g.slug} className="border-b border-line">
                        <Link href={`/guides/${g.slug}`} className="group block py-4">
                          <span className="block font-display text-[1.2rem] font-semibold leading-snug group-hover:underline group-hover:underline-offset-4">{g.title}</span>
                          <span className="mt-1 block text-[15px] text-ink-2">{g.description}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-10"><LeadForm projectKey={p.key} projectName={p.name} quoteNoun={p.quoteNoun} place={place} /></div>

              <p className="mt-6 text-[15px] text-ink-2">Already paid for one? <Link href={`/share-your-quote?project=${p.key}`} className="link">Tell us what it cost</Link>. No name, no email, and it keeps these numbers honest for your neighbors.</p>
            </Chapter>

            <Chapter id="faq" n={chapters.length} total={chapters.length} short="Questions"
              title={`${p.name}: questions people ask us`}
              lead={<>Short answers to what homeowners ask most about {p.noun} prices.</>}>
              <FAQ faqs={p.faqs} bare />
            </Chapter>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <OnThisPage items={chapters} />
              <AdSlot placement="sidebar" />
            </div>
          </aside>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-6xl space-y-14 border-t border-line px-4 pt-12">
        <section id="states" className="scroll-mt-24">
          <h2 className="font-display text-[1.6rem] font-bold tracking-tight">{state ? (metro ? `Other cities in ${state.name}` : `${p.name} cost in ${state.name} cities`) : `${p.name} cost by state`}</h2>
          <div className="mt-4 columns-2 gap-6 border-t border-line pt-2 text-[15px] sm:columns-3 lg:columns-5">
            {(state ? metros : STATES).map((x) => {
              const href = state ? `/${p.slug}/${state.slug}/${(x as MetroRow).slug}` : `/${p.slug}/${(x as StateRow).slug}`;
              return <Link key={href} href={href} className="block min-h-[36px] break-inside-avoid py-1.5 hover:text-accent-600 hover:underline">{x.name}</Link>;
            })}
            {state && metros.length === 0 && <span className="block text-ink-2">No city pages for {state.name} yet. The state figures above apply.</span>}
            {state && <Link href={`/${p.slug}#states`} className="link block py-1.5">All states</Link>}
          </div>
        </section>
        <RelatedProjects exclude={p.slug} stateSlug={state?.slug} title={state ? `More project costs in ${state.name}` : "Price your next project"} />
        <AdSlot placement="beforeFooter" />
      </div>

      <JsonLd data={{
        "@context": "https://schema.org", "@type": "WebApplication", name: `${p.calculatorName}${place ? ` – ${place}` : ""}`,
        applicationCategory: "UtilitiesApplication", operatingSystem: "Any", url: SITE.url, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      }} />
    </>
  );
}
