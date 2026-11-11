import Link from "next/link";
import Calculator from "@/components/Calculator";
import AdSlot from "@/components/AdSlot";
import DataNote from "@/components/DataNote";
import JsonLd from "@/components/JsonLd";
import Sketch, { HouseDiagram } from "@/components/Sketch";
import { COMPARISONS, PROJECTS, comparisonSlug } from "@/lib/projects";
import { METROS, NATIONAL_REGION, STATES } from "@/lib/data";
import { GUIDES } from "@/lib/guides";
import { formatUSD, roundMoney } from "@/lib/format";
import { SITE } from "@/lib/site";

const INTENTS = [
  { n: "01", href: "#estimate", title: "I'm planning a job", body: "Get a budget for your house and ZIP code before you call anyone." },
  { n: "02", href: "/check-my-quote", title: "I've got a quote in hand", body: "See whether it's fair, on the high side, or suspiciously cheap." },
  { n: "03", href: "/repair-or-replace", title: "Something just broke", body: "Leaking roof or dead AC. Find out if it's a repair or a replacement." },
];

const DIAGRAM_ORDER = ["roofing", "solar", "hvac", "windows", "fence"] as const;

export default function Home() {
  const us = Object.fromEntries(PROJECTS.map((p) => [p.key, p.compute(p.defaults(NATIONAL_REGION), NATIONAL_REGION)]));
  const comps = PROJECTS.flatMap((p) => COMPARISONS[p.key].slice(0, 2).map(([a, b]) => ({ p, a, b })));
  return (
    <>
      <section className="border-b border-ink">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-10 lg:grid-cols-[7fr_5fr] lg:gap-14 lg:pt-14">
          <div>
            <p className="label">Home repair cost calculators · Data updated Nov 2026</p>
            <h1 className="mt-4 font-display text-[2.6rem] font-bold leading-[1.04] tracking-tight sm:text-6xl">
              Know the number before anyone <em className="font-normal italic text-accent-600">knocks on your door.</em>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
              Put in your house and your ZIP code. You get the price a fair contractor should land near, with the math written out:
              materials, labor, tear-off, permit. When the quotes come in, you&apos;ll know which one is padded.
            </p>

            <p className="label mt-10">What brings you here?</p>
            <ol className="mt-2 border-t border-ink">
              {INTENTS.map((x) => (
                <li key={x.n} className="border-b border-line">
                  <Link href={x.href} className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 py-4">
                    <span className="font-mono text-sm text-accent-600">{x.n}</span>
                    <span>
                      <span className="font-display text-xl font-semibold group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{x.title}</span>
                      <span className="mt-0.5 block text-[15px] text-ink-2">{x.body}</span>
                    </span>
                    <span className="font-mono text-ink-2 transition group-hover:translate-x-1 group-hover:text-accent-600">→</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <figure className="self-start">
            <div className="grid-paper border border-line bg-paper p-3"><HouseDiagram className="w-full" /></div>
            <figcaption className="mt-3">
              <ol className="grid gap-0 text-[15px]">
                {DIAGRAM_ORDER.map((k, i) => {
                  const p = PROJECTS.find((x) => x.key === k)!;
                  return (
                    <li key={k}>
                      <Link href={`/${p.slug}`} className="leader py-1.5 hover:text-accent-700">
                        <span><span className="mr-2 font-mono text-accent-600">{i + 1}</span>{p.name}</span>
                        <span className="font-mono text-[14px] tnum text-ink-2">~{formatUSD(roundMoney(us[k].typical))}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-2 text-xs text-mute">Typical US price for a standard job. Your ZIP changes it.</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="estimate" className="mx-auto max-w-6xl scroll-mt-16 px-4 pt-12">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-3xl font-bold tracking-tight">Run an estimate</h2>
          <DataNote />
        </div>
        <div className="mt-5"><Calculator projectSlug={PROJECTS[0].slug} projectSwitcher compact /></div>
      </section>

      <div className="mx-auto mt-10 max-w-6xl px-4"><AdSlot placement="afterResult" /></div>

      <section className="mx-auto mt-14 max-w-6xl px-4">
        <h2 className="font-display text-3xl font-bold tracking-tight">Five jobs, priced properly</h2>
        <p className="mt-1 max-w-2xl text-ink-2">The big-ticket replacements that most houses over 30 years old need. Each calculator adjusts for where you live.</p>
        <div className="mt-6 border-t border-ink">
          {PROJECTS.map((p) => (
            <Link key={p.slug} href={`/${p.slug}`} className="group grid grid-cols-[4rem_1fr] items-center gap-4 border-b border-line py-4 sm:grid-cols-[5rem_1.2fr_2fr_auto]">
              <Sketch name={p.key} className="h-12 w-16 text-blue" />
              <span className="font-display text-xl font-semibold group-hover:underline group-hover:underline-offset-4">{p.name}</span>
              <span className="col-span-2 text-[15px] text-ink-2 sm:col-span-1">{p.short}</span>
              <span className="col-span-2 font-mono text-sm tnum sm:col-span-1 sm:text-right">
                <span className="text-mute">US typical </span>{formatUSD(roundMoney(us[p.key].typical))} <span className="text-accent-600">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl gap-12 px-4 lg:grid-cols-[3fr_2fr]">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Head to head</h2>
          <p className="mt-1 text-ink-2">The arguments homeowners have at the kitchen table, settled with numbers.</p>
          <ul className="mt-5 border-t border-ink">
            {comps.map(({ p, a, b }) => (
              <li key={p.slug + a + b} className="border-b border-line">
                <Link href={`/${p.slug}/compare/${comparisonSlug(a, b)}`} className="group flex items-baseline justify-between gap-3 py-3">
                  <span className="text-[16px]"><span className="font-semibold">{p.variants.find((v) => v.slug === a)!.label}</span> <span className="font-display italic text-mute">vs</span> <span className="font-semibold">{p.variants.find((v) => v.slug === b)!.label}</span></span>
                  <span className="font-mono text-ink-2 group-hover:text-accent-600">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Roof prices by city</h2>
          <p className="mt-1 text-ink-2">Labor alone swings 40% between metros.</p>
          <ul className="mt-5 columns-2 gap-6 border-t border-ink pt-3 text-[15px]">
            {METROS.slice(0, 24).map((m) => {
              const st = STATES.find((s) => s.code === m.state)!;
              return <li key={m.slug} className="break-inside-avoid py-1"><Link href={`/roof-replacement-cost/${st.slug}/${m.slug}`} className="hover:text-accent-700 hover:underline">{m.name}<span className="ml-1 font-mono text-xs text-mute">{m.state}</span></Link></li>;
            })}
          </ul>
          <Link href="/roof-replacement-cost#states" className="link mt-3 inline-block text-[15px]">Every state and city</Link>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="flex items-end justify-between"><h2 className="font-display text-3xl font-bold tracking-tight">Worth reading first</h2><Link href="/guides" className="link text-[15px]">All guides</Link></div>
        <div className="mt-5 grid border-t border-ink md:grid-cols-2">
          {GUIDES.slice(0, 6).map((g, i) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className={`group border-b border-line py-5 ${i % 2 === 0 ? "md:pr-8" : "md:border-l md:pl-8"}`}>
              <p className="label">{g.kicker}</p>
              <p className="mt-1 font-display text-xl font-semibold leading-snug group-hover:underline group-hover:underline-offset-4">{g.title}</p>
              <p className="mt-1 text-[15px] text-ink-2">{g.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <blockquote className="border-l-4 border-accent-500 pl-5 sm:pl-8">
          <p className="max-w-3xl font-display text-2xl italic leading-snug sm:text-3xl">
            &ldquo;Most cost sites give you one national range and a button to get called by five contractors. We give you your number and show our working.&rdquo;
          </p>
          <footer className="mt-3 text-[15px] text-ink-2">No sign-up to see a price. <Link href="/how-we-calculate" className="link">How we calculate</Link></footer>
        </blockquote>
      </section>

      <div className="mx-auto mt-14 max-w-6xl px-4"><AdSlot placement="beforeFooter" /></div>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url }} />
    </>
  );
}
