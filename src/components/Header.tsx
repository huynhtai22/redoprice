"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "./Logo";
import { PROJECTS } from "@/lib/projects";

const SHORT: Record<string, string> = { roofing: "Roofs", solar: "Solar", hvac: "Heating & AC", windows: "Windows", fence: "Fences" };

export default function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-ink bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="RedoPrice home" onClick={() => setOpen(false)}><Logo /></Link>
        <nav className="hidden items-center gap-6 text-[15px] md:flex" aria-label="Main">
          {PROJECTS.map((p) => (
            <Link key={p.slug} href={`/${p.slug}`} className={`underline-offset-[6px] hover:underline ${path.startsWith(`/${p.slug}`) ? "font-semibold underline decoration-accent-500 decoration-2" : "text-ink-2"}`}>{SHORT[p.key]}</Link>
          ))}
          <Link href="/check-my-quote" className="border border-ink px-3 py-1.5 font-mono text-[13px] uppercase tracking-wider hover:bg-ink hover:text-paper">Check a quote</Link>
        </nav>
        <button className="-mr-2 p-2 md:hidden" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen((o) => !o)}>
          <span className="sr-only">Menu</span>
          <span className="font-mono text-xs uppercase tracking-wider">{open ? "Close" : "Menu"}</span>
        </button>
      </div>
      {open && (
        <nav id="mnav" className="border-t border-line bg-paper px-4 pb-4 md:hidden" aria-label="Mobile">
          <p className="label pt-4">Cost calculators</p>
          <ul className="mt-1 divide-y divide-line">
            {PROJECTS.map((p) => <li key={p.slug}><Link href={`/${p.slug}`} onClick={() => setOpen(false)} className="block py-3 font-display text-lg">{p.calculatorName}</Link></li>)}
          </ul>
          <p className="label pt-4">Tools</p>
          <ul className="mt-1 divide-y divide-line">
            {[["/check-my-quote", "Is my quote fair?"], ["/repair-or-replace", "Repair or replace?"], ["/guides", "Guides"]].map(([h, l]) => <li key={h}><Link href={h} onClick={() => setOpen(false)} className="block py-3 font-display text-lg">{l}</Link></li>)}
          </ul>
        </nav>
      )}
    </header>
  );
}
