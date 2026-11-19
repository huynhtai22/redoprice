import Link from "next/link";
import Logo from "./Logo";
import { PROJECTS } from "@/lib/projects";
import { DATA_UPDATED } from "@/lib/data";
import ConsentLink from "./ConsentLink";

export default function Footer() {
  const col = (title: string, items: [string, string][]) => (
    <div>
      <p className="label">{title}</p>
      <ul className="mt-3 space-y-2">{items.map(([h, l]) => <li key={h}><Link href={h} className="text-ink-2 hover:text-ink hover:underline">{l}</Link></li>)}</ul>
    </div>
  );
  return (
    <footer className="mt-20 border-t border-line bg-paper text-ink">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 text-[15px] md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs leading-relaxed text-ink-2">Independent cost estimates for home repairs, priced to your ZIP code, with the method and sources published. No contractor or manufacturer can pay to change our numbers.</p>
          <p className="mt-4 text-[13px] text-mute">Cost data updated {DATA_UPDATED}</p>
        </div>
        {col("Calculators", PROJECTS.map((p) => [`/${p.slug}`, p.calculatorName.replace(" Calculator", "")]))}
        {col("Tools & reading", [["/check-my-quote", "Is my quote fair?"], ["/repair-or-replace", "Repair or replace?"], ["/share-your-quote", "Share what you paid"], ["/widget", "Free calculator widget"], ["/guides", "Guides"], ["/how-we-calculate", "How we calculate"]])}
        <div>
          {col("The small print", [["/about", "About"], ["/contact", "Contact"], ["/privacy", "Privacy"], ["/terms", "Terms"], ["/disclaimer", "Disclaimer"]])}
          <div className="mt-2 text-ink-2"><ConsentLink /></div>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-5 text-[13px] leading-relaxed text-mute">
          These are estimates for planning, not quotes. Your house, your materials and your contractor decide the real price. We run ads and may be paid if you ask for quotes through us. © {new Date().getFullYear()} RedoPrice.
        </p>
      </div>
    </footer>
  );
}
