import Link from "next/link";
import Calculator from "@/components/Calculator";
import AdSlot from "@/components/AdSlot";
import DataNote from "@/components/DataNote";
import JsonLd from "@/components/JsonLd";
import Photo from "@/components/Photo";
import Byline from "@/components/Byline";
import RangeChart from "@/components/RangeChart";
import { COMPARISONS, PROJECTS, PROJECT_GROUPS, comparisonSlug, isLaunchProject } from "@/lib/projects";
import { DATASETS, METROS, NATIONAL_REGION, STATES, regionFor } from "@/lib/data";
import { GUIDES } from "@/lib/guides";
import { formatUSD, roundMoney } from "@/lib/format";
import { SITE } from "@/lib/site";

const INTENTS = [
  { n: "01", href: "#estimate", title: "I'm planning a job", body: "Get a budget for your house and ZIP code before you call anyone." },
  { n: "02", href: "/check-my-quote", title: "I've got a quote in hand", body: "See whether it's fair, on the high side, or suspiciously cheap." },
  { n: "03", href: "/repair-or-replace", title: "Something just broke", body: "Leaking roof or dead AC. Find out if it's a repair or a replacement." },
];


export default function Home() {
  const us = Object.fromEntries(PROJECTS.map((p) => [p.key, p.compute(p.defaults(NATIONAL_REGION), NATIONAL_REGION)]));
  const roof = PROJECTS.find((p) => p.key === "roofing")!;
  const ranked = STATES.map((st) => {
    const r = regionFor(st);
    return { st, e: roof.compute(roof.defaults(NATIONAL_REGION), r) };
  }).sort((a, b) => b.e.typical - a.e.typical);
  const pick = [...ranked.slice(0, 5), ...ranked.slice(-5)];
  const roofStates = [
    ...pick.slice(0, 5).map(({ st, e }) => ({ label: st.name, href: `/${roof.slug}/${st.slug}`, low: e.low, typical: e.typical, high: e.high })),
    { label: "United States", low: us.roofing.low, typical: us.roofing.typical, high: us.roofing.high, highlight: true, note: "National typical" },
    ...pick.slice(5).map(({ st, e }) => ({ label: st.name, href: `/${roof.slug}/${st.slug}`, low: e.low, typical: e.typical, high: e.high })),
  ];
  const comps = PROJECTS.filter(isLaunchProject).flatMap((p) => COMPARISONS[p.key].slice(0, 2).map(([a, b]) => ({ p, a, b })));
  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-10 lg:grid-cols-[7fr_5fr] lg:gap-14 lg:pt-14">
          <div className="min-w-0">
            <p className="label">Independent home repair cost data</p>
            <h1 className="mt-3 font-display text-[2.5rem] font-bold leading-[1.08] tracking-[-0.015em] sm:text-[3.4rem]">
              What your home repair should cost, priced for your ZIP code.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
              Fair price ranges for roofs, solar, heating and cooling, windows and fences, built from public wage, materials and energy data.
              Every estimate shows its line items, so you can check a contractor&apos;s quote against it.
            </p>
            <div className="mt-5"><Byline /></div>

            <ol className="mt-9 border-t border-line">
              {INTENTS.map((x) => (
                <li key={x.n} className="border-b border-line">
                  <Link href={x.href} className="group grid grid-cols-[1fr_auto] items-center gap-4 py-4">
                    <span>
                      <span className="block text-[17px] font-semibold group-hover:text-accent-600">{x.title}</span>
                      <span className="mt-0.5 block text-[15px] text-ink-2">{x.body}</span>
                    </span>
                    <span aria-hidden className="text-lg text-mute transition group-hover:translate-x-0.5 group-hover:text-accent-600">→</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
          <Photo name="home" priority ratio="4 / 5" sizes="(min-width: 1024px) 440px, 100vw" className="hidden self-start lg:block" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-[1.9rem] font-bold tracking-tight">Typical prices this month</h2>
            <p className="mt-1 text-[15px] text-ink-2">US typical installed price for a standard job. Your ZIP code moves it, often by 20% or more.</p>
          </div>
          <DataNote />
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[620px] border-t-2 border-ink text-[15px]">
            <thead className="text-left text-[12px] font-semibold uppercase tracking-wider text-mute">
              <tr className="border-b border-line"><th className="py-3 pr-4">Project</th><th className="py-3 pr-4">Standard job</th><th className="py-3 pr-4 text-right">Low</th><th className="py-3 pr-4 text-right">Typical</th><th className="py-3 pr-4 text-right">High</th><th className="py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {PROJECT_GROUPS.flatMap((g) => [
                <tr key={g.key}><th colSpan={6} className="pb-2 pt-6 text-left text-[12px] font-semibold uppercase tracking-wider text-mute">{g.label}</th></tr>,
                ...g.projects.map((p) => {
                const e = us[p.key];
                return (
                  <tr key={p.slug}>
                    <td className="py-3.5 pr-4 font-semibold"><Link href={`/${p.slug}`} className="hover:text-accent-600 hover:underline">{p.name}</Link></td>
                    <td className="py-3.5 pr-4 text-ink-2">{p.short}</td>
                    <td className="py-3.5 pr-4 text-right tnum text-ink-2">{formatUSD(roundMoney(e.low))}</td>
                    <td className="py-3.5 pr-4 text-right font-semibold tnum">{formatUSD(roundMoney(e.typical))}</td>
                    <td className="py-3.5 pr-4 text-right tnum text-ink-2">{formatUSD(roundMoney(e.high))}</td>
                    <td className="py-3.5 text-right"><Link href={`/${p.slug}`} className="link whitespace-nowrap text-[14px]">Price yours</Link></td>
                  </tr>
                );
              })])}
            </tbody>
          </table>
        </div>
      </section>

      <section id="estimate" className="mx-auto max-w-6xl scroll-mt-16 px-4 pt-12">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-[1.9rem] font-bold tracking-tight">Run an estimate</h2>
          <p className="text-[14px] text-mute">Free. No sign-up, no phone number.</p>
        </div>
        <div className="mt-5"><Calculator projectSlug={PROJECTS[0].slug} projectSwitcher compact /></div>
      </section>

      <div className="mx-auto mt-10 max-w-6xl px-4"><AdSlot placement="afterResult" /></div>

      <section className="mx-auto mt-14 grid max-w-6xl gap-10 px-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <p className="label">Where you live matters</p>
          <h2 className="mt-1 font-display text-[1.9rem] font-bold tracking-tight">Roof replacement: the most and least expensive states</h2>
          <p className="mt-1 max-w-2xl text-[15px] text-ink-2">The same one-story, architectural-shingle roof on a US-typical house, priced with each state&apos;s labor and material index. Labor makes up about 55% of the installed rate, so wage gaps drive most of the spread.</p>
          <div className="mt-6"><RangeChart rows={roofStates} caption="One layer of tear-off and a typical permit included. Select a state for its full page." /></div>
        </div>
        <Photo name="roofing" ratio="4 / 5" sizes="340px" className="hidden lg:block" />
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl gap-12 px-4 lg:grid-cols-[3fr_2fr]">
        <div>
          <h2 className="font-display text-[1.6rem] font-bold tracking-tight">Head to head</h2>
          <p className="mt-1 text-ink-2">The arguments homeowners have at the kitchen table, settled with numbers.</p>
          <ul className="mt-5 border-t border-line">
            {comps.map(({ p, a, b }) => (
              <li key={p.slug + a + b} className="border-b border-line">
                <Link href={`/${p.slug}/compare/${comparisonSlug(a, b)}`} className="group flex items-baseline justify-between gap-3 py-3">
                  <span className="text-[16px]"><span className="font-semibold">{p.variants.find((v) => v.slug === a)!.label}</span> <span className="text-mute">vs</span> <span className="font-semibold">{p.variants.find((v) => v.slug === b)!.label}</span></span>
                  <span aria-hidden className="text-mute group-hover:text-accent-600">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-[1.6rem] font-bold tracking-tight">Roof prices by city</h2>
          <p className="mt-1 text-ink-2">Labor alone swings 40% between metros.</p>
          <ul className="mt-5 columns-2 gap-6 border-t border-line pt-3 text-[15px]">
            {METROS.slice(0, 24).map((m) => {
              const st = STATES.find((s) => s.code === m.state)!;
              return <li key={m.slug} className="break-inside-avoid py-1"><Link href={`/roof-replacement-cost/${st.slug}/${m.slug}`} className="hover:text-accent-700 hover:underline">{m.name}<span className="ml-1 text-xs text-mute">{m.state}</span></Link></li>;
            })}
          </ul>
          <Link href="/roof-replacement-cost#states" className="link mt-3 inline-block text-[15px]">Every state and city</Link>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="flex items-end justify-between"><h2 className="font-display text-[1.9rem] font-bold tracking-tight">Before you hire anyone</h2><Link href="/guides" className="link text-[15px]">All guides</Link></div>
        <div className="mt-5 grid border-t border-line md:grid-cols-2">
          {GUIDES.slice(0, 6).map((g, i) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className={`group border-b border-line py-5 ${i % 2 === 0 ? "md:pr-8" : "md:border-l md:pl-8"}`}>
              <p className="label">{g.kicker}</p>
              <p className="mt-1 font-display text-[1.3rem] font-semibold leading-snug group-hover:underline group-hover:underline-offset-4">{g.title}</p>
              <p className="mt-1 text-[15px] text-ink-2">{g.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="rounded-md bg-paper px-5 py-8 sm:px-8">
          <h2 className="font-display text-[1.9rem] font-bold tracking-tight">How we get our numbers</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-semibold">Public data, not copied tables</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">Labor costs come from Bureau of Labor Statistics wage data for construction trades. Energy prices come from the EIA and solar output from NREL. We never copy another site&apos;s price table.</p>
            </div>
            <div>
              <h3 className="font-semibold">The math is on the page</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">Each estimate lists materials, labor, tear-off and permit separately, so you can line it up with a quote. The full formula is published.</p>
            </div>
            <div>
              <h3 className="font-semibold">Nobody pays to move a number</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">We earn money from ads and, if you ask, from introductions to contractors. Neither changes an estimate. You never need to sign up to see a price.</p>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4 text-[14px] text-ink-2">
            <span>Datasets: {DATASETS.length}, updated {DATASETS[0]?.updated}</span>
            <Link href="/how-we-calculate" className="link">Read the methodology</Link>
            <Link href="/share-your-quote" className="link">Share what you paid</Link>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-14 max-w-6xl px-4"><AdSlot placement="beforeFooter" /></div>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url }} />
    </>
  );
}
