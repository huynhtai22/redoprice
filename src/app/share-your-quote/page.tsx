import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ShareQuoteForm from "@/components/ShareQuoteForm";
import RelatedProjects from "@/components/RelatedProjects";
export const metadata: Metadata = { title: "Share Your Real Quote (Anonymous)", description: "Help other homeowners: share what you were quoted or paid for a roof, solar, HVAC, windows or fence. Anonymous, no contact details.", alternates: { canonical: "/share-your-quote" } };
export default async function Page({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const { project } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 pt-5">
      <div>
        <Breadcrumbs items={[{ href: "/share-your-quote", label: "Share your quote" }]} />
        <h1 className="mt-3 font-display text-[2.1rem] font-bold leading-tight tracking-tight sm:text-5xl">Share your real quote</h1>
        <p className="mt-2 text-ink-2">Real prices from real homeowners are the best cost data there is. Share yours in under a minute. It&apos;s anonymous, and it makes estimates more accurate for the next person in your area.</p>
      </div>
      <ShareQuoteForm defaultProject={project} />
      <RelatedProjects title="Estimate another project" />
    </div>
  );
}
