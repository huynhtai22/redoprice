const QUESTIONS = [
  "Are you licensed and insured in this state? Show me the certificate.",
  "Is this quote itemized: materials, labor, removal, permit, cleanup?",
  "Who pulls the permit, and is the fee in this price?",
  "If you find rot or bad ducts, what's the price per sheet, per foot, per run?",
  "Which exact product, brand and line are you installing?",
  "What do you warranty on labor, and for how long?",
  "What's the payment schedule? (Don't pay more than a third up front.)",
  "When do you start, and how many days on site?",
];
export default function ContractorChecklist({ noun = "contractor" }: { noun?: string }) {
  return (
    <section className="border border-ink bg-paper p-5 sm:p-7">
      <p className="label">Print this. Ask every one of them.</p>
      <h2 className="mt-1 font-display text-[1.6rem] font-bold">Eight questions for any {noun}</h2>
      <ol className="mt-4 grid gap-x-8 sm:grid-cols-2">
        {QUESTIONS.map((q, i) => (
          <li key={q} className="flex gap-3 border-b border-dashed border-line-2 py-2.5 text-[15px] text-ink-2">
            <span className="mt-[3px] h-4 w-4 shrink-0 border border-ink" aria-hidden />
            <span><span className="mr-1 font-mono text-xs text-mute">{i + 1}.</span>{q}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
