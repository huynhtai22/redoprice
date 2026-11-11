import Link from "next/link";
import Logo from "./Logo";
import { PROJECTS } from "@/lib/projects";
import { SITE } from "@/lib/site";
import { DATA_UPDATED } from "@/lib/data";
import ConsentLink from "./ConsentLink";

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-3 text-white/60">{SITE.tagline}. Cost data updated {DATA_UPDATED}.</p>
        </div>
        <div>
          <p className="font-semibold">Calculators</p>
          <ul className="mt-2 space-y-1.5">{PROJECTS.map((p) => <li key={p.slug}><Link href={`/${p.slug}`} className="text-white/65 hover:text-white">{p.calculatorName}</Link></li>)}</ul>
        </div>
        <div>
          <p className="font-semibold">Tools & guides</p>
          <ul className="mt-2 space-y-1.5">
            {[["/check-my-quote", "Is my quote fair?"], ["/repair-or-replace", "Repair or replace?"], ["/share-your-quote", "Share your real quote"], ["/guides", "Guides"], ["/how-we-calculate", "How we calculate"]].map(([h, l]) => <li key={h}><Link href={h} className="text-white/65 hover:text-white">{l}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="font-semibold">Company</p>
          <ul className="mt-2 space-y-1.5">
            {[["/about", "About"], ["/contact", "Contact"], ["/privacy", "Privacy Policy"], ["/terms", "Terms of Use"], ["/disclaimer", "Disclaimer"]].map(([h, l]) => <li key={h}><Link href={h} className="text-white/65 hover:text-white">{l}</Link></li>)}
            <li><ConsentLink /></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs leading-relaxed text-white/45">
          Estimates are for planning only and are not quotes or professional advice. Actual prices depend on your home, materials and contractor.
          {" "}This site shows ads and may earn money when you request quotes through partners. © {new Date().getFullYear()} {SITE.name}.
        </p>
      </div>
    </footer>
  );
}
