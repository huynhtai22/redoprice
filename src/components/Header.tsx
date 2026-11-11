"use client";
import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";
import Icon from "./Icons";
import { NAV } from "@/lib/site";
import { PROJECTS } from "@/lib/projects";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-15 max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="RedoPrice home" onClick={() => setOpen(false)}><Logo /></Link>
        <nav className="hidden items-center gap-1 text-sm font-semibold md:flex" aria-label="Main">
          {PROJECTS.map((p) => (
            <Link key={p.slug} href={`/${p.slug}`} className="rounded-full px-3 py-1.5 text-ink-2 hover:bg-canvas hover:text-ink">{p.name.split(" ")[0]}</Link>
          ))}
          <Link href="/check-my-quote" className="ml-2 rounded-full bg-ink px-4 py-2 text-white hover:bg-navy">Check my quote</Link>
        </nav>
        <button className="rounded-md p-2 md:hidden" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen((o) => !o)}>
          <span className="sr-only">Menu</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
        </button>
      </div>
      {open && (
        <nav id="mnav" className="border-t border-line bg-white px-4 py-3 md:hidden" aria-label="Mobile">
          <ul className="grid gap-1">
            {PROJECTS.map((p) => (
              <li key={p.slug}><Link href={`/${p.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-2 py-2.5 font-medium"><Icon name={p.icon} className="h-5 w-5 text-accent-600" />{p.calculatorName}</Link></li>
            ))}
          </ul>
          <ul className="mt-2 grid gap-1 border-t border-line pt-2">
            {NAV.slice(1).map((n) => <li key={n.href}><Link href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2.5 font-semibold">{n.label}</Link></li>)}
          </ul>
        </nav>
      )}
    </header>
  );
}
