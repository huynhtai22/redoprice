"use client";
/**
 * Printable quote-check sheet. Hidden on screen; when the visitor prints, only this sheet prints.
 * One page to take to the kitchen table: the job as described, the fair range, our line items with
 * blank columns for three contractor quotes, and the questions and warning signs to check.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Region } from "@/lib/data";
import type { Estimate, Inputs, Project } from "@/lib/engine";
import { formatNum, formatUSD, roundMoney } from "@/lib/format";
import { QUESTIONS } from "./ContractorChecklist";
import { SITE } from "@/lib/site";
import { track } from "@/lib/track";

const WARNINGS = [
  "One lump-sum price with no breakdown",
  "Pressure to sign today for a special discount",
  "More than a third of the price asked up front, or cash only",
  "No license number, no insurance certificate, no street address",
  "Knocked on your door after a storm and offers to cover your deductible",
];

export function PrintSheetButton({ project }: { project: string }) {
  return (
    <button type="button" onClick={() => { track("print_sheet", { project }); window.print(); }} className="inline-flex min-h-[40px] items-center font-semibold text-ink underline-offset-4 hover:underline">
      Print a quote-check sheet
    </button>
  );
}

export default function QuoteSheet(props: { p: Project; inputs: Inputs; region: Region; est: Estimate }) {
  // Rendered straight into <body> so print CSS can drop the whole page and keep only this sheet.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(<Sheet {...props} />, document.body) : null;
}

function Sheet({ p, inputs, region, est }: { p: Project; inputs: Inputs; region: Region; est: Estimate }) {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const job = p.inputs(region).map((inp) => ({
    label: inp.label,
    value: inp.type === "slider"
      ? `${inp.prefix ?? ""}${formatNum(Number(inputs[inp.key]))} ${inp.unit}`
      : inp.options.find((o) => o.value === String(inputs[inp.key]))?.label ?? String(inputs[inp.key]),
  }));
  const cell = "border border-[#999] px-2 py-1.5";
  return (
    <section className="print-sheet" aria-hidden>
      <header className="flex items-end justify-between border-b-2 border-black pb-2">
        <div>
          <p className="text-[11pt] font-semibold">{SITE.name} quote-check sheet</p>
          <h1 className="font-display text-[20pt] font-bold leading-tight">{p.name}: {region.label}</h1>
        </div>
        <p className="text-right text-[9pt]">Printed {today}<br />{SITE.url.replace(/^https?:\/\//, "")}/{p.slug}</p>
      </header>

      <div className="mt-3 grid grid-cols-[1fr_1.1fr] gap-6">
        <div>
          <h2 className="text-[11pt] font-bold">The job</h2>
          <table className="mt-1 w-full border-collapse text-[9.5pt]">
            <tbody>{job.map((j) => <tr key={j.label}><td className={`${cell} w-1/2`}>{j.label}</td><td className={cell}>{j.value}</td></tr>)}</tbody>
          </table>
        </div>
        <div>
          <h2 className="text-[11pt] font-bold">A fair price for this job</h2>
          <p className="mt-1 text-[9.5pt]">Low {formatUSD(roundMoney(est.low))} · <strong>Typical {formatUSD(roundMoney(est.typical))}</strong> · High {formatUSD(roundMoney(est.high))}</p>
          <p className="mt-1 text-[8.5pt]">A quote below the low end usually leaves something out. Above the high end, ask what you get for the extra, and get another quote.</p>
        </div>
      </div>

      <h2 className="mt-4 text-[11pt] font-bold">Line by line: our estimate against your quotes</h2>
      <table className="mt-1 w-full border-collapse text-[9.5pt]">
        <thead><tr className="bg-[#eee]"><th className={`${cell} text-left`}>Item</th><th className={`${cell} text-right`}>Our typical</th><th className={cell}>Quote A</th><th className={cell}>Quote B</th><th className={cell}>Quote C</th></tr></thead>
        <tbody>
          {est.breakdown.map((l) => <tr key={l.label}><td className={cell}>{l.label}</td><td className={`${cell} text-right`}>{formatUSD(roundMoney(l.value))}</td><td className={cell} /><td className={cell} /><td className={cell} /></tr>)}
          <tr className="font-bold"><td className={cell}>Total</td><td className={`${cell} text-right`}>{formatUSD(roundMoney(est.typical))}</td><td className={cell} /><td className={cell} /><td className={cell} /></tr>
          {["Contractor name and license #", "Product and brand", "Labor warranty (years)", "Deposit asked", "Start date and days on site"].map((r) => (
            <tr key={r}><td className={cell}>{r}</td><td className={`${cell} bg-[#f4f4f4]`} /><td className={cell} /><td className={cell} /><td className={cell} /></tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 grid grid-cols-[1.4fr_1fr] gap-6 text-[9pt]">
        <div>
          <h2 className="text-[11pt] font-bold">Ask every contractor</h2>
          <ol className="mt-1 space-y-0.5">{QUESTIONS.map((q, i) => <li key={q}>☐ {i + 1}. {q}</li>)}</ol>
        </div>
        <div>
          <h2 className="text-[11pt] font-bold">Walk away if you see</h2>
          <ul className="mt-1 space-y-0.5">{WARNINGS.map((w) => <li key={w}>☐ {w}</li>)}</ul>
        </div>
      </div>

      <p className="mt-4 border-t border-black pt-2 text-[8pt]">
        This is an estimate from public wage, material and energy data for {region.label}, not a quote. Real prices depend on your house and your contractor.
        Method: {SITE.url.replace(/^https?:\/\//, "")}/how-we-calculate
      </p>
    </section>
  );
}
