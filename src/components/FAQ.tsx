import JsonLd from "./JsonLd";
import type { FAQ as F } from "@/lib/engine";

export default function FAQ({ faqs, title = "Questions people ask us", bare = false }: { faqs: F[]; title?: string; bare?: boolean }) {
  return (
    <section>
      {!bare && <h2 className="font-display text-[1.75rem] font-bold tracking-tight">{title}</h2>}
      <div className={`${bare ? "" : "mt-4 "}border-t border-line`}>
        {faqs.map((f) => (
          <details key={f.q} className="group border-b border-line py-4">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold">{f.q}<span aria-hidden className="text-xl text-mute group-open:hidden">+</span><span aria-hidden className="hidden text-xl text-mute group-open:inline">−</span></summary>
            <p className="mt-2 max-w-[68ch] leading-relaxed text-ink-2">{f.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
    </section>
  );
}
