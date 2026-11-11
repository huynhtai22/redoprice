import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectPage from "@/components/ProjectPage";
import { PROJECTS, getProject } from "@/lib/projects";
import { METROS, STATES, getMetro, getState, regionFor } from "@/lib/data";
import { formatUSD, roundMoney } from "@/lib/format";
import { isIndexable } from "@/lib/indexing";

export const dynamicParams = false;
export const generateStaticParams = () =>
  PROJECTS.flatMap((p) => METROS.map((m) => ({ project: p.slug, slug: STATES.find((s) => s.code === m.state)!.slug, city: m.slug })));

export async function generateMetadata({ params }: { params: Promise<{ project: string; slug: string; city: string }> }): Promise<Metadata> {
  const { project, slug, city } = await params;
  const p = getProject(project); const st = getState(slug); const m = getMetro(slug, city);
  if (!p || !st || !m) return {};
  const r = regionFor(st, m); const e = p.compute(p.defaults(r), r);
  return {
    title: `${p.name} Cost in ${m.name}, ${st.code} (2026): ${formatUSD(roundMoney(e.low))}–${formatUSD(roundMoney(e.high))}`,
    description: `Is your ${p.noun} quote fair? Typical ${p.name.toLowerCase()} prices in ${m.name}, adjusted for local labor. Check any quote against the local range.`,
    alternates: { canonical: `/${p.slug}/${st.slug}/${m.slug}` },
    robots: isIndexable("city", p, m) ? undefined : { index: false, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<{ project: string; slug: string; city: string }> }) {
  const { project, slug, city } = await params;
  const p = getProject(project); const st = getState(slug); const m = getMetro(slug, city);
  if (!p || !st || !m) notFound();
  return <ProjectPage p={p} state={st} metro={m} />;
}
