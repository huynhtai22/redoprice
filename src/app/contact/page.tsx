import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import { SITE } from "@/lib/site";
export const metadata: Metadata = { title: "Contact", description: `Contact ${SITE.name}.`, alternates: { canonical: "/contact" } };
export default function Page() {
  return (
    <StaticPage title="Contact us" path="/contact">
      <p>Questions, corrections or partnership ideas? Email us at <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. We read every message and usually reply within two business days.</p>
      <h2>Reporting a wrong number</h2>
      <p>Tell us the project, your ZIP code and what you were quoted. Even better, <Link href="/share-your-quote">share the quote anonymously</Link> so it can improve the estimates for everyone.</p>
      <h2>Advertising and press</h2>
      <p>For press requests or data for a story, email the address above with &quot;Press&quot; in the subject line.</p>
    </StaticPage>
  );
}
