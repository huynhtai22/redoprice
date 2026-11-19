/**
 * One section of a cost page. Every section shares the same rhythm so the page reads as one guided story:
 * a numbered kicker, a serif heading, a one-sentence lead that picks up from the section before,
 * the content, then a quiet pointer to the next section.
 * Spacing scale used across cost pages: 8 / 16 / 24 / 40 / 64 px (Tailwind 2 / 4 / 6 / 10 / 16).
 */
export type ChapterRef = { id: string; short: string };

export default function Chapter({ id, n, total, short, title, lead, next, children }: {
  id: string; n: number; total: number; short: string; title: string; lead?: React.ReactNode; next?: ChapterRef; children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 border-t border-line pt-10 pb-6 first:border-t-0 first:pt-0">
      <p className="text-[14px] font-semibold text-accent-600"><span className="tnum">{n}</span> <span className="text-mute">of {total}</span> <span aria-hidden className="mx-1 text-line-2">/</span> {short}</p>
      <h2 id={`${id}-h`} className="mt-2 font-display text-[1.75rem] font-bold leading-tight tracking-[-0.01em] sm:text-[2rem]">{title}</h2>
      {lead && <p className="mt-2 max-w-[65ch] text-[17px] leading-relaxed text-ink-2">{lead}</p>}
      <div className="mt-6">{children}</div>
      {next && (
        <p className="mt-10 text-[15px]">
          <a href={`#${next.id}`} className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-ink-2 hover:text-accent-600">
            Next: {next.short} <span aria-hidden>↓</span>
          </a>
        </p>
      )}
    </section>
  );
}
