import Link from "next/link";
import Calculator from "@/components/Calculator";
import AdSlot from "@/components/AdSlot";
import Icon from "@/components/Icons";
import DataNote from "@/components/DataNote";
import JsonLd from "@/components/JsonLd";
import { COMPARISONS, PROJECTS, comparisonSlug } from "@/lib/projects";
import { METROS, STATES } from "@/lib/data";
import { GUIDES } from "@/lib/guides";
import { SITE } from "@/lib/site";

const INTENTS = [
  { href: "#projects", icon: "plan", title: "Plan a project", body: "Get a realistic budget for your home and ZIP code, and compare materials by lifetime cost." },
  { href: "/check-my-quote", icon: "quote", title: "Check my quote", body: "Got a number from a contractor? See where it falls on the local low, typical and high range." },
  { href: "/repair-or-replace", icon: "alert", title: "Emergency repair", body: "Leak or broken AC? Get a quick repair-or-replace answer and what to ask before you sign." },
];

export default function Home() {
  const comps = PROJECTS.flatMap((p) => COMPARISONS[p.key].slice(0, 2).map(([a, b]) => ({ p, a, b })));
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:pt-12">
          <p className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1 text-xs font-bold text-accent-700"><span className="h-1.5 w-1.5 rounded-full bg-accent-500" />Free · no sign-up · adjusted for your ZIP</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Know what it should cost <span className="text-accent-500">before anyone quotes you.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-2">Live cost calculators for roofs, solar, HVAC, windows and fences. Your inputs, your area&apos;s labor and material prices, and the math shown.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {INTENTS.map((x) => (
              <Link key={x.title} href={x.href} className="group flex gap-3 rounded-2xl border border-line bg-canvas/60 p-4 transition hover:border-ink/25 hover:bg-white">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-accent-600 shadow-sm"><Icon name={x.icon} /></span>
                <span><span className="flex items-center gap-1 font-bold">{x.title}<Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-0.5" /></span><span className="mt-0.5 block text-sm text-ink-2">{x.body}</span></span>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Calculator projectSlug={PROJECTS[0].slug} projectSwitcher compact />
          </div>
          <div className="mt-3"><DataNote /></div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-6xl px-4"><AdSlot placement="afterResult" /></div>

      <section id="projects" className="mx-auto mt-10 max-w-6xl scroll-mt-20 px-4">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Plan a project</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PROJECTS.map((p) => (
            <Link key={p.slug} href={`/${p.slug}`} className="card group p-5 transition hover:border-ink/25 hover:shadow-sm">
              <Icon name={p.icon} className="h-7 w-7 text-accent-600" />
              <p className="mt-3 font-bold">{p.name}</p>
              <p className="mt-1 text-sm text-ink-2">{p.short}</p>
              <p className="mt-3 text-sm font-semibold text-accent-700 group-hover:underline">Open calculator →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl gap-8 px-4 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Popular comparisons</h2>
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
            {comps.map(({ p, a, b }) => (
              <li key={p.slug + a + b}><Link href={`/${p.slug}/compare/${comparisonSlug(a, b)}`} className="flex items-center justify-between px-4 py-3 text-sm font-semibold hover:text-accent-700">
                {p.variants.find((v) => v.slug === a)!.label} vs {p.variants.find((v) => v.slug === b)!.label}<Icon name="arrow" className="h-4 w-4" />
              </Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Roof replacement cost near you</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {METROS.slice(0, 20).map((m) => {
              const st = STATES.find((s) => s.code === m.state)!;
              return <Link key={m.slug} href={`/roof-replacement-cost/${st.slug}/${m.slug}`} className="inline-block max-w-full rounded-full border border-line bg-white px-3 py-1.5 text-sm hover:border-ink/30">{m.name}, {m.state}</Link>;
            })}
            <Link href="/roof-replacement-cost#states" className="rounded-full px-3 py-1.5 text-sm font-semibold text-accent-700">All states →</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl px-4">
        <div className="flex items-end justify-between"><h2 className="font-display text-2xl font-bold tracking-tight">Guides</h2><Link href="/guides" className="text-sm font-semibold text-accent-700">All guides →</Link></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.slice(0, 6).map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="card p-5 hover:border-ink/25">
              <p className="text-xs font-bold uppercase tracking-wide text-accent-700">{g.kicker}</p>
              <p className="mt-1 font-semibold">{g.title}</p>
              <p className="mt-1 text-sm text-ink-2">{g.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl px-4">
        <div className="card grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
          {[["Your number, not a national average", "Every estimate uses your inputs and your area's labor and material costs."], ["The math, shown", "Materials, labor, removal and permits as a visible breakdown, with sources and an updated date."], ["No sign-up to see a price", "Estimates are instant and free. We only ask for contact details if you want quotes."]].map(([t, b]) => (
            <div key={t}><p className="font-bold">{t}</p><p className="mt-1 text-sm text-ink-2">{b}</p></div>
          ))}
        </div>
      </section>

      <div className="mx-auto mt-12 max-w-6xl px-4"><AdSlot placement="beforeFooter" /></div>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url }} />
    </>
  );
}
