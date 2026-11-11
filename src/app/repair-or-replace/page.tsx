import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import RepairOrReplace from "@/components/RepairOrReplace";
import AdSlot from "@/components/AdSlot";
import ContractorChecklist from "@/components/ContractorChecklist";
import RelatedProjects from "@/components/RelatedProjects";
import FAQ from "@/components/FAQ";

export const metadata: Metadata = {
  title: "Repair or Replace? Roof & AC Decision Tool",
  description: "Roof leak or broken AC? Answer three questions and get a quick repair-or-replace call, typical repair costs and what to ask the contractor.",
  alternates: { canonical: "/repair-or-replace" },
};

export default function Page() {
  return (
    <>
      <div className="border-b border-ink">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-5">
          <Breadcrumbs items={[{ href: "/repair-or-replace", label: "Repair or replace" }]} />
          <h1 className="mt-3 font-display text-[2.1rem] font-bold leading-tight tracking-tight sm:text-5xl">Repair or replace?</h1>
          <p className="mt-2 max-w-3xl text-ink-2">Something broke and you need to decide fast. Answer three questions for a quick call, then see what replacement would cost in your area.</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pt-6"><RepairOrReplace /></div>
      <div className="mx-auto mt-8 max-w-6xl space-y-12 px-4">
        <ContractorChecklist />
        <AdSlot placement="midContent" />
        <FAQ faqs={[
          { q: "What should I do right now about a roof leak?", a: "Move belongings, catch the water, and if it is safe, have a roofer place a tarp. Take photos for insurance. Avoid going on a wet roof yourself." },
          { q: "What is the $5,000 rule for HVAC?", a: "Multiply the system's age by the repair cost. If the result is over $5,000, replacement is usually the better value. It is a rule of thumb, so also weigh efficiency and comfort." },
          { q: "Will my homeowners insurance cover it?", a: "Sudden damage from storms, falling trees or similar events is often covered. Wear and age-related failures usually are not." },
        ]} />
        <RelatedProjects />
      </div>
    </>
  );
}
