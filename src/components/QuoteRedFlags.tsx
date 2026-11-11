"use client";
import { useMemo, useState } from "react";
import type { Region } from "@/lib/data";
import type { Estimate, Inputs, Project } from "@/lib/engine";
import { formatUSD, roundMoney } from "@/lib/format";
import { depositFlag, itemsToQuestion, lineChecks, priceFlags, questionsToAsk, worstSeverity, type Severity } from "@/lib/redflags";
import { track } from "@/lib/track";
import AreaQuotes from "./AreaQuotes";

const SEV: Record<Severity, { word: string; text: string; bar: string }> = {
  high: { word: "Red flag", text: "text-bad", bar: "border-bad" },
  check: { word: "Check", text: "text-warn", bar: "border-warn" },
  ok: { word: "OK", text: "text-good", bar: "border-good" },
};

const num = (s: string) => Number(s.replace(/[^0-9.]/g, "")) || 0;

type Props = { p: Project; est: Estimate; quote: number; region: Region; zip: string; inputs: Inputs };

/** Shown under the calculator on /check-my-quote once a quote amount is entered. */
export default function QuoteRedFlags({ p, est, quote, region, zip }: Props) {
  const [lines, setLines] = useState<Record<string, string>>({});
  const [deposit, setDeposit] = useState("");
  const [copied, setCopied] = useState(false);

  const quoted = useMemo(() => Object.fromEntries(Object.entries(lines).filter(([, v]) => v.trim() !== "").map(([k, v]) => [k, num(v)])), [lines]);
  const flags = useMemo(() => {
    const f = priceFlags(quote, est, region.label, p.noun);
    const d = depositFlag(num(deposit), quote, region.state.code);
    return d ? [...f, d] : f;
  }, [quote, est, region, p.noun, deposit]);
  const checks = useMemo(() => lineChecks(est, quoted, quote), [est, quoted, quote]);
  const questions = useMemo(() => questionsToAsk(p, flags, checks), [p, flags, checks]);
  const all = [...flags, ...checks];
  const worst = worstSeverity(all);
  const issues = all.filter((x) => x.severity !== "ok").length;

  async function copy() {
    const text = `Questions about the ${p.noun} quote (${formatUSD(quote)}):\n\n` + questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
    track("redflag_copy_questions", { project: p.key, issues });
  }

  const input = "w-full border border-line-2 bg-white px-2.5 py-2 text-right font-mono text-[15px] tnum outline-none focus:border-ink";

  return (
    <section id="red-flags" data-ad-exclusion-zone className="mt-10 border-t-2 border-ink pt-5" aria-labelledby="rf-h">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="rf-h" className="font-display text-[1.75rem] font-bold tracking-tight">What to check in this quote</h2>
        <p className={`text-[15px] font-semibold ${SEV[worst].text}`}>
          {issues === 0 ? "No red flags found so far" : `${issues} ${issues === 1 ? "item" : "items"} to question`}
        </p>
      </div>
      <p className="mt-1 max-w-3xl text-[15px] text-ink-2">
        Compared with a typical {p.noun} job of the same size and {p.variantNoun} in {region.label}{zip.length === 5 ? ` (ZIP ${zip})` : ""}. Add the line items and deposit from your quote for a closer check.
      </p>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Findings */}
        <div className="min-w-0">
          <h3 className="label">Findings</h3>
          <ul className="mt-2 border-t border-line">
            {flags.map((f) => (
              <li key={f.id} className={`border-b border-line border-l-[3px] py-3 pl-4 ${SEV[f.severity].bar}`}>
                <p className="text-[15px]"><span className={`mr-2 text-[13px] font-semibold uppercase tracking-wide ${SEV[f.severity].text}`}>{SEV[f.severity].word}</span><strong>{f.title}</strong></p>
                <p className="mt-1 text-[15px] leading-relaxed text-ink-2">{f.detail}</p>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-end gap-3">
            <label htmlFor="rf-deposit" className="flex-1 text-[15px] font-semibold">
              Deposit they asked for <span className="font-normal text-mute">(optional)</span>
              <input id="rf-deposit" inputMode="numeric" placeholder="$" value={deposit} onChange={(e) => setDeposit(e.target.value)} className={`${input} mt-1.5 block max-w-[12rem] !text-left`} />
            </label>
          </div>
        </div>

        {/* Line items */}
        <div className="min-w-0">
          <h3 className="label">Line items <span className="normal-case tracking-normal">(optional, from your quote)</span></h3>
          <table className="mt-2 w-full border-t border-ink text-[15px]">
            <thead>
              <tr className="text-left text-[13px] text-mute">
                <th className="py-2 font-medium">Line</th>
                <th className="w-[8.5rem] py-2 text-right font-medium">Your quote</th>
                <th className="w-[6.5rem] py-2 text-right font-medium">Typical here</th>
              </tr>
            </thead>
            <tbody>
              {est.breakdown.map((l) => {
                const c = checks.find((x) => x.label === l.label);
                return (
                  <tr key={l.label} className="border-t border-line align-top">
                    <td className="py-2 pr-2">
                      {l.label}
                      {c && c.severity !== "ok" && <span className={`block text-[13px] ${SEV[c.severity].text}`}>{formatUSD(roundMoney(c.diff))} over typical</span>}
                    </td>
                    <td className="py-1.5">
                      <input aria-label={`${l.label} on your quote`} inputMode="numeric" placeholder="$" value={lines[l.label] ?? ""}
                        onChange={(e) => setLines((cur) => ({ ...cur, [l.label]: e.target.value }))}
                        className={`${input} ${c && c.severity !== "ok" ? (c.severity === "high" ? "border-bad" : "border-warn") : ""}`} />
                    </td>
                    <td className="py-2 text-right font-mono tnum text-ink-2">{formatUSD(roundMoney(l.value))}</td>
                  </tr>
                );
              })}
              {checks.filter((c) => c.label === "Not itemized").map((c) => (
                <tr key="gap" className="border-t border-line">
                  <td className="py-2 pr-2">Not on any line<span className="block text-[13px] text-warn">Ask what this covers</span></td>
                  <td className="py-2 text-right font-mono tnum">{formatUSD(roundMoney(c.quoted))}</td>
                  <td className="py-2 text-right font-mono tnum text-mute">–</td>
                </tr>
              ))}
              <tr className="border-t border-ink font-semibold">
                <td className="py-2">Total</td>
                <td className="py-2 text-right font-mono tnum">{formatUSD(quote)}</td>
                <td className="py-2 text-right font-mono tnum">{formatUSD(roundMoney(est.typical))}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-[13px] text-mute">Lines are flagged when they run more than 35% and at least $250 over our typical figure. Contractors split costs differently, so compare the total first.</p>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-bold">Lines that often hide padding on a {p.noun} quote</h3>
          <ul className="mt-3 border-t border-line">
            {itemsToQuestion(p.key).map((t) => (
              <li key={t} className="border-b border-line py-2.5 text-[15px] leading-relaxed text-ink-2">{t}</li>
            ))}
          </ul>
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-xl font-bold">What to ask the contractor</h3>
            <button onClick={copy} className="shrink-0 border border-ink px-3 py-1.5 text-[14px] font-semibold hover:bg-ink hover:text-paper">{copied ? "Copied" : "Copy questions"}</button>
          </div>
          <ol className="mt-3 border-t border-line">
            {questions.map((q, i) => (
              <li key={q} className="grid grid-cols-[1.75rem_1fr] border-b border-line py-2.5 text-[15px] leading-relaxed text-ink-2">
                <span className="font-mono text-[13px] text-mute tnum">{i + 1}.</span><span>{q}</span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[13px] text-mute">Ask in writing (email or text) so the answers become part of the deal.</p>
        </div>
      </div>

      <div className="mt-10">
        <AreaQuotes projectKey={p.key} projectNoun={p.noun} zip={zip} stateCode={region.state.code} quote={quote} />
      </div>
    </section>
  );
}
