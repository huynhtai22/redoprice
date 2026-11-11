import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = { title: "Home Improvement Cost Guides", description: "Plain-English guides to pricing, hiring and deciding on roofs, solar, HVAC, windows and fences.", alternates: { canonical: "/guides" } };

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-5">
      <Breadcrumbs items={[{ href: "/guides", label: "Guides" }]} />
      <h1 className="mt-3 font-display text-[2.1rem] font-bold leading-tight tracking-tight sm:text-5xl">Guides</h1>
      <p className="mt-2 max-w-2xl text-ink-2">How to budget, compare quotes and decide, written to be read in five minutes.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="card p-5 hover:border-ink/25">
            <p className="label">{g.kicker}</p>
            <h2 className="mt-1 font-semibold">{g.title}</h2>
            <p className="mt-1 text-sm text-ink-2">{g.description}</p>
          </Link>
        ))}
      </div>
      <div className="mt-10"><AdSlot placement="beforeFooter" /></div>
    </div>
  );
}
