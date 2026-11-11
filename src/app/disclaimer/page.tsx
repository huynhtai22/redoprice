import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import { SITE } from "@/lib/site";
export const metadata: Metadata = { title: "Disclaimer", description: "Estimates are for planning only.", alternates: { canonical: "/disclaimer" } };
export default function Page() {
  return (
    <StaticPage title="Disclaimer" path="/disclaimer" updated="November 11, 2026">
      <h2>Estimates, not quotes</h2>
      <p>All prices on {SITE.name} are estimates produced by a cost model for general planning. They are not quotes, bids, offers or professional advice. Actual costs depend on your home, local codes, products, site conditions and the contractor you hire. Always get written quotes from licensed, insured contractors.</p>
      <h2>Modeled data</h2>
      <p>Some regional figures are modeled estimates pending full import of public datasets, and are labeled as such. Data can be out of date. See <Link href="/how-we-calculate">how we calculate</Link>.</p>
      <h2>No professional relationship</h2>
      <p>Using this site does not create a contractor, engineering, legal, tax or financial advisory relationship. Tax and incentive information (for example, solar credits) is general and may change; consult a tax professional.</p>
      <h2>Advertising and partner disclosure</h2>
      <p>{SITE.name} displays ads, including Google AdSense. If you request quotes, we may share your details with contractors or lead networks who may pay us. We do not endorse any contractor and are not responsible for their work.</p>
      <h2>Safety</h2>
      <p>Roofing, electrical, gas and HVAC work can be dangerous. Do-it-yourself figures are informational; follow local codes and use licensed pros where required.</p>
    </StaticPage>
  );
}
