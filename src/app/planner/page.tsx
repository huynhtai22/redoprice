import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import Planner from "@/components/Planner";
import AdSlot from "@/components/AdSlot";
import FAQ from "@/components/FAQ";

export const metadata: Metadata = {
  title: "Home Project Planner: Budget Several Projects at Once",
  description: "Save estimates for your roof, kitchen, HVAC and more into one budget with a reserve for surprises and a monthly savings target. No sign-up; saved in your browser.",
  alternates: { canonical: "/planner" },
};

export default function Page() {
  return (
    <>
      <div className="border-b border-ink">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-5">
          <Breadcrumbs items={[{ href: "/planner", label: "My plan" }]} />
          <h1 className="mt-3 font-display text-[2.1rem] font-bold leading-tight tracking-tight sm:text-5xl">My home project plan</h1>
          <p className="mt-2 max-w-3xl text-ink-2">Every job you have priced, on one sheet. Sort them by when they need doing, keep a reserve for surprises, and see what to save each month. No account; it stays in this browser.</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pt-6"><Planner /></div>
      <div className="mx-auto mt-10 max-w-6xl space-y-12 px-4 print:hidden">
        <AdSlot placement="afterResult" />
        <FAQ faqs={[
          { q: "How much should I set aside for surprises?", a: "10% for simple replacements like a water heater or garage door, 15% for most projects, and 20% for older homes or remodels where walls and floors get opened up." },
          { q: "Which projects should come first?", a: "Anything that keeps water out (roof, gutters, grading, plumbing leaks) and anything unsafe (old electrical panels, failing decks) comes before comfort and looks. Water damage makes every other project more expensive." },
          { q: "Is it cheaper to do several projects at once?", a: "Sometimes. Pairing jobs that share a trade or access, like a roof with gutters, siding with windows, or flooring with interior paint, saves on setup, permits and disposal." },
          { q: "Where is my plan stored?", a: "Only in this browser. Clearing your browsing data removes it. Use “Copy a link to share” to save a copy or send it to someone." },
        ]} />
      </div>
    </>
  );
}
