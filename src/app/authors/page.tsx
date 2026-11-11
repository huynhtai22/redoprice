import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import { PEOPLE, personUrl } from "@/lib/people";

export const metadata: Metadata = {
  title: "Authors and Expert Reviewers",
  description: "Who writes RedoPrice's cost pages and which licensed trade professionals check them.",
  alternates: { canonical: "/authors" },
};

export default function Page() {
  const group = (kind: "author" | "reviewer") => PEOPLE.filter((p) => p.kind === kind && (p.published || kind === "reviewer"));
  return (
    <StaticPage title="People behind the numbers" path="/authors">
      <p>Our pages are written by the team that maintains the cost model. Each trade gets a licensed professional who checks the numbers and the advice. We only name a reviewer once a real person has signed on. Until then, the page says the review is pending.</p>
      {(["author", "reviewer"] as const).map((k) => (
        <section key={k}>
          <h2>{k === "author" ? "Authors" : "Expert reviewers"}</h2>
          <ul className="!list-none !pl-0 border-t border-ink">
            {group(k).map((p) => (
              <li key={p.slug} className="!mb-0 border-b border-line py-3">
                <Link href={personUrl(p)} className="!no-underline">
                  <span className="font-semibold text-ink">{p.published ? p.name : p.role}</span>
                  {!p.published && <span className="ml-2 border border-warn px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-wider text-warn">Open role</span>}
                </Link>
                <span className="mt-0.5 block text-[15px]">{p.short}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <h2>Want to review for us?</h2>
      <p>If you are a licensed roofing, HVAC, solar, window or fencing contractor or estimator in the US and want paid, part-time review work, <Link href="/contact">get in touch</Link>.</p>
    </StaticPage>
  );
}
