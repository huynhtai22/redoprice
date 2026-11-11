import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import { SITE } from "@/lib/site";
export const metadata: Metadata = { title: "Terms of Use", description: `Terms of use for ${SITE.name}.`, alternates: { canonical: "/terms" } };
export default function Page() {
  return (
    <StaticPage title="Terms of Use" path="/terms" updated="November 11, 2026">
      <p>By using {SITE.domain} (&quot;the site&quot;) you agree to these terms.</p>
      <h2>Use of the site</h2>
      <p>The calculators and content are provided free for personal, non-commercial use. Do not scrape, copy or republish substantial parts of the site, or use it in a way that harms the site or other users.</p>
      <h2>No warranty</h2>
      <p>The site and all estimates are provided &quot;as is&quot; without warranties of any kind. See the <Link href="/disclaimer">Disclaimer</Link>.</p>
      <h2>Limitation of liability</h2>
      <p>To the fullest extent allowed by law, {SITE.name} is not liable for any loss arising from use of the site or reliance on its estimates, or from any contractor you contact through it.</p>
      <h2>Submissions</h2>
      <p>When you share a quote anonymously, you grant us the right to use it in aggregated form to improve and publish cost data. Do not include personal information in free-text fields.</p>
      <h2>Third-party links and ads</h2>
      <p>The site contains ads and links to third parties. We are not responsible for their content or practices.</p>
      <h2>Changes</h2>
      <p>We may update these terms. Continued use means you accept the updated terms. Questions: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.</p>
    </StaticPage>
  );
}
