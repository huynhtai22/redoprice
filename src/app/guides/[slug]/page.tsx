import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import RelatedProjects from "@/components/RelatedProjects";
import { GUIDES, getGuide, type Block } from "@/lib/guides";
import { getProject } from "@/lib/projects";
import { SITE } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => GUIDES.map((g) => ({ slug: g.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = getGuide((await params).slug);
  return g ? { title: g.title, description: g.description, alternates: { canonical: `/guides/${g.slug}` }, openGraph: { type: "article" } } : {};
}

function render(b: Block, i: number) {
  if ("h2" in b) return <h2 key={i}>{b.h2}</h2>;
  if ("p" in b) return <p key={i}>{b.p}</p>;
  if ("ul" in b) return <ul key={i}>{b.ul.map((x) => <li key={x}>{x}</li>)}</ul>;
  return <ol key={i}>{b.ol.map((x) => <li key={x}>{x}</li>)}</ol>;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const p = g.project ? getProject(g.project) : undefined;
  // mid-article ad after the 2nd heading
  let h2s = 0;
  return (
    <>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0">
          <Breadcrumbs items={[{ href: "/guides", label: "Guides" }, { href: `/guides/${g.slug}`, label: g.kicker }]} />
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-accent-700">{g.kicker}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{g.title}</h1>
          <p className="mt-2 text-sm text-mute">By the RedoPrice team · Updated <time dateTime={g.updated}>{new Date(g.updated + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time></p>
          {p && (
            <Link href={`/${p.slug}`} className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-accent-100 bg-accent-50 p-4 text-sm font-semibold">
              <span>Get your own number: {p.calculatorName}</span><span className="text-accent-700">Open →</span>
            </Link>
          )}
          <div className="prose-x mt-6 max-w-[70ch]">
            {g.body.map((b, i) => {
              const el = render(b, i);
              if ("h2" in b && ++h2s === 3) return <Fragment key={i}><div className="my-8 not-prose"><AdSlot placement="midContent" /></div>{el}</Fragment>;
              return el;
            })}
          </div>
          {p && <Link href={`/${p.slug}`} className="mt-6 inline-flex rounded-full bg-accent-500 px-5 py-3 font-semibold text-white hover:bg-accent-600">Try the {p.name.toLowerCase()} calculator →</Link>}
        </article>
        <aside className="hidden lg:block"><div className="sticky top-20 pt-10"><AdSlot placement="sidebar" /></div></aside>
      </div>
      <div className="mx-auto mt-12 max-w-6xl space-y-12 px-4">
        <section>
          <h2 className="font-display text-2xl font-bold">More guides</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {GUIDES.filter((x) => x.slug !== g.slug).slice(0, 3).map((x) => <Link key={x.slug} href={`/guides/${x.slug}`} className="card p-4 hover:border-ink/25"><p className="text-xs font-bold uppercase text-accent-700">{x.kicker}</p><p className="mt-1 font-semibold">{x.title}</p></Link>)}
          </div>
        </section>
        <RelatedProjects exclude={p?.slug} />
        <AdSlot placement="beforeFooter" />
      </div>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.description, dateModified: g.updated, author: { "@type": "Organization", name: SITE.name }, publisher: { "@type": "Organization", name: SITE.name } }} />
    </>
  );
}
