import type { Metadata } from "next";
import Calculator from "@/components/Calculator";
import AdSlot from "@/components/AdSlot";
import Breadcrumbs from "@/components/Breadcrumbs";
import DataNote from "@/components/DataNote";
import ContractorChecklist from "@/components/ContractorChecklist";
import RelatedProjects from "@/components/RelatedProjects";
import FAQ from "@/components/FAQ";
import { PROJECTS } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Is My Contractor Quote Fair? Free Quote Checker",
  description: "Enter the price you were quoted and a few details about the job. See if it is low, fair or high compared with typical prices in your ZIP code.",
  alternates: { canonical: "/check-my-quote" },
};

export default function Page() {
  return (
    <>
      <div className="border-b border-ink">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-5">
          <Breadcrumbs items={[{ href: "/check-my-quote", label: "Check my quote" }]} />
          <h1 className="mt-3 font-display text-[2.1rem] font-bold leading-tight tracking-tight sm:text-5xl">Is my quote fair?</h1>
          <p className="mt-2 max-w-3xl text-ink-2">Pick the project, enter the price you were quoted, and describe the job. We plot your quote on the low, typical and high range for your ZIP code.</p>
          <div className="mt-3"><DataNote /></div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pt-6"><Calculator projectSlug={PROJECTS[0].slug} mode="quote" projectSwitcher /></div>
      <div className="mx-auto mt-8 max-w-6xl space-y-12 px-4">
        <AdSlot placement="afterResult" />
        <ContractorChecklist />
        <FAQ faqs={[
          { q: "What counts as a fair quote?", a: "A quote inside the typical range for your area and job size, with an itemized breakdown. Quotes at the top of the range can be fair when they include better products or a longer warranty." },
          { q: "My quote is much lower than the estimate. Is that good?", a: "Sometimes, but check what is missing: removal and disposal, permits, underlayment or ductwork are common exclusions that come back later as change orders." },
          { q: "How many quotes should I get?", a: "Three is the usual advice. It gives you a sense of the local market and makes it easier to spot an outlier." },
        ]} />
        <RelatedProjects />
        <AdSlot placement="beforeFooter" />
      </div>
    </>
  );
}
