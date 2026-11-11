import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import { SITE } from "@/lib/site";
import { PHOTOS } from "@/lib/photos";
export const metadata: Metadata = { title: "About", description: `About ${SITE.name}: free, transparent home improvement cost calculators.`, alternates: { canonical: "/about" } };
export default function Page() {
  return (
    <StaticPage title={`About ${SITE.name}`} path="/about">
      <p>{SITE.name} helps homeowners know what a project should cost before anyone quotes them. Most cost sites show a national range in a table. We built calculators that use your home&apos;s details and your area&apos;s labor and material costs, and we show every part of the math.</p>
      <h2>What we believe</h2>
      <ul>
        <li><strong>Your number, not a national average.</strong> Prices differ by 40% or more between regions.</li>
        <li><strong>Show the math.</strong> Every estimate breaks down materials, labor, removal and permits, with sources and a last-updated date.</li>
        <li><strong>No sign-up to see a price.</strong> Estimates are free and instant.</li>
      </ul>
      <h2>How we make money</h2>
      <p>{SITE.name} is free to use. We show advertising, and if you choose to request quotes, we may be paid by the contractors or networks we connect you with. Neither affects the estimates: they come from the same model for everyone.</p>
      <h2>Our data</h2>
      <p>Read <Link href="/how-we-calculate">how we calculate</Link> for the model, sources and refresh schedule. If you spot a number that looks off for your area, <Link href="/contact">tell us</Link> or <Link href="/share-your-quote">share a real quote</Link>.</p>
      <h2>Photo credits</h2>
      <p>Photos are used under the Unsplash License. Thank you to the photographers:</p>
      <ul>{Object.values(PHOTOS).map((ph) => <li key={ph.id}><a href={ph.page} rel="nofollow noopener" target="_blank">{ph.alt}</a>, {ph.credit}</li>)}</ul>
    </StaticPage>
  );
}
