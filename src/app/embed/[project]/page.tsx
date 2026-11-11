import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Calculator from "@/components/Calculator";
import EmbedFrame from "@/components/EmbedFrame";
import { PROJECTS, getProject } from "@/lib/projects";
import { SITE } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => PROJECTS.map((p) => ({ project: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ project: string }> }): Promise<Metadata> {
  const p = getProject((await params).project);
  if (!p) return {};
  return { title: `${p.calculatorName} (embed)`, robots: { index: false, follow: true }, alternates: { canonical: `/${p.slug}` } };
}

/** The calculator as served inside a third-party iframe. No site chrome, no ads. */
export default async function Page({ params }: { params: Promise<{ project: string }> }) {
  const p = getProject((await params).project);
  if (!p) notFound();
  return (
    <div className="bg-canvas px-3 pb-3 pt-3 sm:px-4">
      <EmbedFrame />
      <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-ink pb-2">
        <p className="font-display text-lg font-bold leading-tight">{p.calculatorName}</p>
        <a href={`${SITE.url}/${p.slug}`} className="shrink-0 text-[13px] text-ink-2 underline underline-offset-2">by {SITE.name}</a>
      </div>
      <Calculator projectSlug={p.slug} compact />
      <p className="mt-2 text-[12px] text-mute">Estimate from {SITE.name}&apos;s cost model, adjusted for your area. Not a quote. <a href={`${SITE.url}/how-we-calculate`} className="underline">How it&apos;s calculated</a></p>
    </div>
  );
}
