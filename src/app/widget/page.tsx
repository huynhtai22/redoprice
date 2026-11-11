import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import WidgetBuilder from "@/components/WidgetBuilder";
import FAQ from "@/components/FAQ";

export const metadata: Metadata = {
  title: "Free Home Improvement Cost Calculator for Your Website",
  description: "Add a free roof, solar, HVAC, window or fence cost calculator to your site. ZIP-adjusted estimates, no sign-up, copy and paste one line of code.",
  alternates: { canonical: "/widget" },
};

export default function Page() {
  return (
    <>
      <div className="border-b border-ink">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-5">
          <Breadcrumbs items={[{ href: "/widget", label: "Calculator widget" }]} />
          <h1 className="mt-3 font-display text-[2.1rem] font-bold leading-tight tracking-tight sm:text-5xl">Put a cost calculator on your site</h1>
          <p className="mt-2 max-w-3xl text-ink-2">Free for real estate agents, home bloggers, local news sites and anyone writing about home projects. Your readers get a ZIP-adjusted estimate without leaving your page. No sign-up, no ads inside the widget.</p>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-6xl space-y-12 px-4">
        <WidgetBuilder />
        <section className="max-w-3xl">
          <h2 className="font-display text-[1.6rem] font-bold">Terms, in plain English</h2>
          <ul className="mt-3 border-t border-line text-[15px] text-ink-2">
            {[
              "Free to use on any site, commercial or not.",
              "Keep the credit line and link under the frame, unchanged.",
              "Don't place it on pages about something unrelated to homes, or make it look like your own pricing.",
              "We update the numbers when we publish a new data release. Nothing for you to do.",
            ].map((t) => <li key={t} className="border-b border-line py-2.5">{t}</li>)}
          </ul>
        </section>
        <FAQ faqs={[
          { q: "Does the widget show ads or collect my readers' data?", a: "No. The embedded calculator has no ads and no tracking cookies. Inputs stay in the reader's browser." },
          { q: "Will it slow my page down?", a: "The frame loads lazily, only when a reader scrolls to it, so it does not affect your page's first load." },
          { q: "Can I change the colors?", a: "Not yet. Tell us through the contact page if you need a dark or narrow version." },
        ]} />
      </div>
    </>
  );
}
