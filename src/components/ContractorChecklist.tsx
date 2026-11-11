const QUESTIONS = [
  "Are you licensed and insured in this state? Can I see the certificate of insurance?",
  "Is this quote itemized: materials, labor, removal, permits and cleanup?",
  "Who pulls the permit, and is the permit fee included?",
  "What happens if you find hidden damage (rotten wood, bad ducts)? What is the per-unit price?",
  "Which exact product, brand and model will you install?",
  "What warranty do you give on workmanship, and what does the manufacturer cover?",
  "What is the payment schedule? (Avoid paying more than a third upfront.)",
  "When can you start, and how long will the job take?",
];
export default function ContractorChecklist({ noun = "contractor" }: { noun?: string }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold">Questions to ask every {noun}</h2>
      <ol className="mt-3 grid gap-2 text-sm text-ink-2">
        {QUESTIONS.map((q, i) => (
          <li key={q} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-50 text-xs font-bold text-accent-700">{i + 1}</span><span className="pt-0.5">{q}</span></li>
        ))}
      </ol>
    </section>
  );
}
