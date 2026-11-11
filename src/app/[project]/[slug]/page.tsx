import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectPage from "@/components/ProjectPage";
import { PROJECTS, getProject, getVariant } from "@/lib/projects";
import { STATES, getState, regionFor } from "@/lib/data";
import { formatUSD, roundMoney } from "@/lib/format";
import { isIndexable } from "@/lib/indexing";

export const dynamicParams = false;
export const generateStaticParams = () =>
  PROJECTS.flatMap((p) => [...p.variants.map((v) => ({ project: p.slug, slug: v.slug })), ...STATES.map((s) => ({ project: p.slug, slug: s.slug }))]);

function resolve(project: string, slug: string) {
  const p = getProject(project);
  if (!p) return null;
  const variant = getVariant(p, slug);
  const state = variant ? undefined : getState(slug);
  if (!variant && !state) return null;
  return { p, variant, state };
}

export async function generateMetadata({ params }: { params: Promise<{ project: string; slug: string }> }): Promise<Metadata> {
  const { project, slug } = await params;
  const r = resolve(project, slug);
  if (!r) return {};
  const { p, variant, state } = r;
  if (variant) {
    return { title: `${variant.label} Cost (2026): Price Calculator & Pros/Cons`, description: `${variant.label} cost, lifespan and cost per year compared with other ${p.variantPlural}. ${variant.blurb.slice(0, 90)}`, alternates: { canonical: `/${p.slug}/${variant.slug}` } };
  }
  const e = p.compute(p.defaults(regionFor(state!)), regionFor(state!));
  return {
    title: `${p.name} Cost in ${state!.name} (2026): ${formatUSD(roundMoney(e.low))}–${formatUSD(roundMoney(e.high))}`,
    description: `What a ${p.noun} costs in ${state!.name}, adjusted for local labor and materials. Free calculator with a breakdown by ${p.variantNoun}.`,
    alternates: { canonical: `/${p.slug}/${state!.slug}` },
    robots: isIndexable("state", p) ? undefined : { index: false, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<{ project: string; slug: string }> }) {
  const { project, slug } = await params;
  const r = resolve(project, slug);
  if (!r) notFound();
  return <ProjectPage p={r.p} variant={r.variant} state={r.state} />;
}
