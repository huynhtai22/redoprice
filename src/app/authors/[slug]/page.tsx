import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import Sketch from "@/components/Sketch";
import { PEOPLE, getPerson, personSchema, personUrl } from "@/lib/people";
import { PROJECTS, projectByKey } from "@/lib/projects";
import { GUIDES } from "@/lib/guides";
import { longDate } from "@/lib/format";
import { SITE } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => PEOPLE.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPerson((await params).slug);
  if (!p) return {};
  return {
    title: p.published ? `${p.name}, ${p.role}` : p.role,
    description: p.short,
    alternates: { canonical: personUrl(p) },
    // Placeholder profiles exist so the layout can be reviewed, but are kept out of search.
    ...(p.published ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPerson((await params).slug);
  if (!p) notFound();
  const projects = p.covers === "all" ? PROJECTS : p.covers.map(projectByKey);
  const guides = GUIDES.filter((g) => p.covers === "all" || projects.some((x) => x.slug === g.project));
  const initials = p.published && p.slug !== "cost-desk" ? p.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("") : "RP";

  return (
    <div className="mx-auto max-w-4xl px-4 pt-5">
      <Breadcrumbs items={[{ href: "/authors", label: "People" }, { href: personUrl(p), label: p.published ? p.name : p.role }]} />

      <header className="mt-6 grid gap-6 border-b border-line py-6 sm:grid-cols-[120px_minmax(0,1fr)]">
        <div className="grid aspect-square w-[120px] place-items-center overflow-hidden rounded-md border border-line bg-paper">
          {p.photo
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={p.photo} alt={p.name} className="h-full w-full object-cover grayscale" />
            : <span className="font-display text-4xl font-bold text-accent-600">{initials}</span>}
        </div>
        <div className="min-w-0">
          <p className="label">{p.kind === "reviewer" ? "Expert reviewer" : "Author"}</p>
          <h1 className="mt-1 font-display text-[2.1rem] font-bold leading-tight tracking-tight sm:text-[2.6rem]">{p.published ? p.name : p.role}</h1>
          <p className="mt-1 text-lg text-ink-2">{p.published ? p.role : p.short}</p>
          {!p.published && (
            <p className="mt-3 rounded-md border-l-4 border-warn bg-warn-50 px-3 py-2 text-[15px] text-ink">
              <strong>This role is open.</strong> No one is listed as a reviewer until a real, licensed professional has signed on, and pages in this area say &quot;Trade review pending&quot; until then.
            </p>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="prose-x min-w-0">
          {p.bio.map((b) => <p key={b}>{b}</p>)}

          {p.credentials.length > 0 && (
            <>
              <h2>Licenses and credentials</h2>
              <ul>
                {p.credentials.map((c) => (
                  <li key={c.label}>
                    <strong>{c.label}</strong>{c.issuer ? `, ${c.issuer}` : ""}{c.id ? ` (No. ${c.id})` : ""}
                    {c.verifyUrl && <> · <a href={c.verifyUrl} target="_blank" rel="noopener">Verify</a></>}
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2>{p.kind === "reviewer" ? "What a review covers" : "What we are responsible for"}</h2>
          {p.kind === "reviewer" ? (
            <ul>
              <li>Installed price ranges and the split between materials and labor.</li>
              <li>Default assumptions: waste factors, removal, permits, job difficulty.</li>
              <li>The cost factors, FAQs and red flags on each page, for accuracy and missing caveats.</li>
              <li>A signed-off review date, shown in the page&apos;s byline. Reviews repeat at least twice a year.</li>
            </ul>
          ) : (
            <ul>
              <li>The cost model and every data release (see <Link href="/how-we-calculate">how we calculate</Link>).</li>
              <li>Writing and updating calculator pages and guides.</li>
              <li>Corrections: email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> and we fix confirmed errors within a week.</li>
            </ul>
          )}
        </div>

        <aside className="space-y-6 text-[15px]">
          <div>
            <p className="label">Covers</p>
            <ul className="mt-2 border-t border-ink">
              {projects.map((x) => (
                <li key={x.slug} className="border-b border-line">
                  <Link href={`/${x.slug}`} className="flex items-center gap-3 py-2 hover:text-accent-700">
                    <Sketch name={x.icon} className="h-7 w-7 shrink-0 text-blue" />
                    <span>{x.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {p.since && <p className="font-mono text-xs text-mute">With {SITE.name} since {longDate(p.since)}</p>}
          {p.sameAs.length > 0 && <ul className="space-y-1">{p.sameAs.map((u) => <li key={u}><a href={u} className="link" rel="me noopener" target="_blank">{new URL(u).hostname.replace("www.", "")}</a></li>)}</ul>}
        </aside>
      </div>

      {p.published && guides.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">Guides</h2>
          <ul className="mt-3 border-t border-ink">
            {guides.map((g) => <li key={g.slug} className="border-b border-line py-3"><Link href={`/guides/${g.slug}`} className="font-semibold hover:underline">{g.title}</Link></li>)}
          </ul>
        </section>
      )}

      {p.published && (
        <JsonLd data={{ "@context": "https://schema.org", "@type": "ProfilePage", url: `${SITE.url}${personUrl(p)}`, mainEntity: personSchema(p) }} />
      )}
    </div>
  );
}
