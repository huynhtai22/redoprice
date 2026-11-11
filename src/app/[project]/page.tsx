import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectPage from "@/components/ProjectPage";
import { PROJECTS, getProject } from "@/lib/projects";

export const dynamicParams = false;
export const generateStaticParams = () => PROJECTS.map((p) => ({ project: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ project: string }> }): Promise<Metadata> {
  const p = getProject((await params).project);
  if (!p) return {};
  return { title: `${p.calculatorName} (2026, by ZIP code)`, description: `${p.short} Free, instant, with a cost breakdown and local average.`, alternates: { canonical: `/${p.slug}` } };
}

export default async function Page({ params }: { params: Promise<{ project: string }> }) {
  const p = getProject((await params).project);
  if (!p) notFound();
  return <ProjectPage p={p} />;
}
