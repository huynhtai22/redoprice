"use client";
import { useEffect, useState } from "react";
import type { ChapterRef } from "./Chapter";

/** Sticky outline of a cost page's sections, highlighting the one being read. */
export default function OnThisPage({ items }: { items: ChapterRef[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id);
    }, { rootMargin: "-20% 0px -65% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="On this page">
      <p className="text-[14px] font-semibold text-ink">On this page</p>
      <ol className="mt-3 border-l border-line">
        {items.map((i, idx) => (
          <li key={i.id}>
            <a href={`#${i.id}`} aria-current={active === i.id ? "true" : undefined}
              className={`-ml-px flex min-h-[40px] items-center gap-2 border-l-2 pl-3 text-[15px] ${active === i.id ? "border-accent-500 font-semibold text-ink" : "border-transparent text-ink-2 hover:text-ink"}`}>
              <span className="w-4 text-mute tnum">{idx + 1}</span>{i.short}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
