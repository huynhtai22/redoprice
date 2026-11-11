import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";
import { SITE } from "@/lib/site";
export const metadata: Metadata = { title: "Privacy Policy", description: `How ${SITE.name} handles data, cookies and advertising.`, alternates: { canonical: "/privacy" } };
export default function Page() {
  return (
    <StaticPage title="Privacy Policy" path="/privacy" updated="November 11, 2026">
      <p>This policy explains what {SITE.name} ({SITE.domain}) collects and how it is used.</p>
      <h2>Calculator inputs</h2>
      <p>Calculator inputs (such as ZIP code and home size) are processed in your browser to produce estimates. They are stored in the page address so you can share a link, and are not sent to us unless you submit a form.</p>
      <h2>Forms</h2>
      <ul>
        <li><strong>Quote requests (optional):</strong> if you ask to compare with local pros, we collect your name, phone, optional email, ZIP code, project timing and a link to your estimate, and share them with up to 3 contractors or partner networks so they can contact you. We record your consent and the time you gave it.</li>
        <li><strong>Share your quote (anonymous):</strong> we collect the project, ZIP code, size, price and outcome. No name or contact details. We publish only aggregated figures.</li>
        <li><strong>Email:</strong> if you email us, we use your message only to reply.</li>
      </ul>
      <h2 id="cookies">Cookies and advertising</h2>
      <p>We use Google AdSense to show ads. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visits to this site and/or other sites on the Internet.</p>
      <p>You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" rel="nofollow noopener">Google Ads Settings</a>, or opt out of some third-party vendors&apos; use of cookies at <a href="https://www.aboutads.info/choices/" rel="nofollow noopener">aboutads.info</a>. See <a href="https://policies.google.com/technologies/partner-sites" rel="nofollow noopener">how Google uses information from sites that use its services</a>.</p>
      <p>We may use Google Analytics to understand how the calculators are used (pages viewed, calculator interactions). You can change your cookie choices at any time with the &quot;Cookie choices&quot; link in the footer. Visitors in the EEA, UK and Switzerland see ads without personalization unless they consent.</p>
      <h2>Your rights</h2>
      <p>Depending on where you live (for example California under the CCPA/CPRA, or the EEA/UK under the GDPR), you may have rights to access, delete or correct your personal data and to opt out of its sale or sharing. To use them, email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.</p>
      <h2>Retention and security</h2>
      <p>We keep quote-request data only as long as needed to connect you with pros and meet legal record-keeping (such as consent records), then delete it. We use reasonable safeguards, but no system is perfectly secure.</p>
      <h2>Children</h2>
      <p>The site is not directed to children under 13 and we do not knowingly collect their data.</p>
      <h2>Changes and contact</h2>
      <p>We may update this policy and will change the date above. Questions: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.</p>
    </StaticPage>
  );
}
