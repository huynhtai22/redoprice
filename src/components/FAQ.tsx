import JsonLd from "./JsonLd";
import type { FAQ as F } from "@/lib/engine";

export default function FAQ({ faqs, title = "Frequently asked questions" }: { faqs: F[]; title?: string }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
        {faqs.map((f) => (
          <details key={f.q} className="group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">{f.q}<span className="text-mute transition group-open:rotate-45">+</span></summary>
            <p className="mt-2 leading-relaxed text-ink-2">{f.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
    </section>
  );
}
