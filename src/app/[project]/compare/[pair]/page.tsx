import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Calculator from "@/components/Calculator";
import AdSlot from "@/components/AdSlot";
import Breadcrumbs from "@/components/Breadcrumbs";
import DataNote from "@/components/DataNote";
import RelatedProjects from "@/components/RelatedProjects";
import { COMPARISONS, PROJECTS, comparisonSlug, getProject, parseComparison } from "@/lib/projects";
import { NATIONAL_REGION } from "@/lib/data";
import { formatUSD, roundMoney } from "@/lib/format";

export const dynamicParams = false;
export const generateStaticParams = () => PROJECTS.flatMap((p) => COMPARISONS[p.key].map(([a, b]) => ({ project: p.slug, pair: comparisonSlug(a, b) })));

export async function generateMetadata({ params }: { params: Promise<{ project: string; pair: string }> }): Promise<Metadata> {
  const { project, pair } = await params;
  const p = getProject(project); const vs = p && parseComparison(p, pair);
  if (!p || !vs) return {};
  return { title: `${vs[0].label} vs ${vs[1].label}: Cost, Lifespan & Value (2026)`, description: `${vs[0].label} vs ${vs[1].label} compared on installed price, lifetime cost per year, pros and cons. Free calculator for your ZIP code.`, alternates: { canonical: `/${p.slug}/compare/${pair}` } };
}

export default async function Page({ params }: { params: Promise<{ project: string; pair: string }> }) {
  const { project, pair } = await params;
  const p = getProject(project); const vs = p && parseComparison(p, pair);
  if (!p || !vs) notFound();
  const R = NATIONAL_REGION; const d = p.defaults(R);
  const rows = vs.map((v) => ({ v, e: p.compute({ ...d, [p.variantKey]: v.value }, R) }));
  const [a, b] = rows;
  const cheaperUp = a.e.typical < b.e.typical ? a : b;
  const perYear = (x: typeof a) => (x.e.lifespanYears ? x.e.typical / x.e.lifespanYears : x.e.typical);
  const cheaperLife = perYear(a) < perYear(b) ? a : b;
  return (
    <>
      <div className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-5">
          <Breadcrumbs items={[{ href: `/${p.slug}`, label: p.name }, { href: `/${p.slug}/compare/${pair}`, label: `${a.v.label} vs ${b.v.label}` }]} />
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{a.v.label} vs {b.v.label}: cost compared</h1>
          <p className="mt-2 max-w-3xl text-ink-2">
            On a typical US home, <strong className="text-ink">{cheaperUp.v.label}</strong> costs less upfront ({formatUSD(roundMoney(Math.abs(a.e.typical - b.e.typical)))} less), while{" "}
            <strong className="text-ink">{cheaperLife.v.label}</strong> costs less per year of life. Plug in your home and ZIP to see your own numbers.
          </p>
          <div className="mt-3"><DataNote /></div>
        </div>
      </div>
      <div className="mx-auto mt-6 grid max-w-6xl gap-4 px-4 sm:grid-cols-2">
        {rows.map(({ v, e }) => (
          <div key={v.slug} className="card p-5">
            <h2 className="font-display text-xl font-bold">{v.label}</h2>
            <p className="mt-1 font-display text-3xl font-extrabold text-accent-600 tnum">{formatUSD(roundMoney(e.typical))}</p>
            <p className="text-sm text-ink-2 tnum">Range {formatUSD(roundMoney(e.low))} to {formatUSD(roundMoney(e.high))}{e.lifespanYears ? ` · ${e.lifespanYears} years · ${formatUSD(e.typical / e.lifespanYears)}/yr` : ""}</p>
            <p className="mt-3 text-sm text-ink-2">{v.blurb}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <ul className="list-disc space-y-1 pl-4 text-ink-2"><li className="list-none -ml-4 font-bold text-good">Pros</li>{v.pros.map((x) => <li key={x}>{x}</li>)}</ul>
              <ul className="list-disc space-y-1 pl-4 text-ink-2"><li className="list-none -ml-4 font-bold text-bad">Cons</li>{v.cons.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
            <Link href={`/${p.slug}/${v.slug}`} className="mt-3 inline-block text-sm font-semibold text-accent-700 underline">{v.label} cost details →</Link>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-8 max-w-6xl px-4">
        <h2 className="mb-3 font-display text-2xl font-bold">Try both on your home</h2>
        <Calculator projectSlug={p.slug} preset={{ [p.variantKey]: a.v.value }} />
      </div>
      <div className="mx-auto mt-8 max-w-6xl space-y-12 px-4">
        <AdSlot placement="afterResult" />
        <section>
          <h2 className="font-display text-2xl font-bold">More comparisons</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {PROJECTS.flatMap((pp) => COMPARISONS[pp.key].map(([x, y]) => ({ pp, x, y }))).filter(({ pp, x, y }) => !(pp.slug === p.slug && comparisonSlug(x, y) === pair)).map(({ pp, x, y }) => (
              <Link key={pp.slug + x + y} href={`/${pp.slug}/compare/${comparisonSlug(x, y)}`} className="inline-block max-w-full rounded-full border border-line bg-white px-3 py-1.5 text-sm hover:border-ink/30">
                {pp.variants.find((v) => v.slug === x)!.label} vs {pp.variants.find((v) => v.slug === y)!.label}
              </Link>
            ))}
          </div>
        </section>
        <RelatedProjects exclude={p.slug} />
        <AdSlot placement="beforeFooter" />
      </div>
    </>
  );
}
