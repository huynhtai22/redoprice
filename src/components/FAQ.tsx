import JsonLd from "./JsonLd";
import type { FAQ as F } from "@/lib/engine";

export default function FAQ({ faqs, title = "Questions people ask us" }: { faqs: F[]; title?: string }) {
  return (
    <section>
      <h2 className="font-display text-[1.75rem] font-bold tracking-tight">{title}</h2>
      <div className="mt-4 border-t border-ink">
        {faqs.map((f) => (
          <details key={f.q} className="group border-b border-line py-4">
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 text-[17px] font-semibold">{f.q}<span className="font-mono text-accent-600 group-open:hidden">+</span><span className="hidden font-mono text-accent-600 group-open:inline">−</span></summary>
            <p className="mt-2 max-w-[68ch] leading-relaxed text-ink-2">{f.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
    </section>
  );
}
