"use client";
import { useState, type FormEvent } from "react";
import { PROJECTS } from "@/lib/projects";
import { postJSON } from "@/lib/submit";
import { track } from "@/lib/track";

/** Anonymous first-party price data. No name, email or phone is collected. */
export default function ShareQuoteForm({ defaultProject }: { defaultProject?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [proj, setProj] = useState(defaultProject ?? PROJECTS[0].key);
  const p = PROJECTS.find((x) => x.key === proj)!;
  const variantInput = p.inputs({ laborIndex: 1, materialIndex: 1, label: "", state: { code: "US", name: "", slug: "", laborIndex: 1, materialIndex: 1, climate: [], zip3: [] } }).find((i) => i.key === p.variantKey);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("website")) return;
    setStatus("sending");
    const res = await postJSON(process.env.NEXT_PUBLIC_QUOTE_DATA_ENDPOINT, {
      type: "shared-quote", project: proj, zip: fd.get("zip"), variant: fd.get("variant"), size: fd.get("size"),
      quoteAmount: Number(String(fd.get("amount")).replace(/[^0-9.]/g, "")), quotesReceived: fd.get("quotes"), outcome: fd.get("outcome"),
      quoteMonth: fd.get("month"), submittedAt: new Date().toISOString(),
    }, "shared-quote");
    if (res.ok) { setStatus("done"); track("share_quote_submit", { project: proj }); } else { setStatus("error"); setError(res.error); }
  }

  const input = "mt-1 w-full border border-line-2 bg-white px-3 py-2.5 text-base outline-none focus:border-accent-500";
  if (status === "done") return <div id="share-quote" className="card p-6 text-center font-semibold" aria-live="polite">Thank you. Your anonymous quote helps make these estimates more accurate for everyone.</div>;
  return (
    <section id="share-quote" data-ad-exclusion-zone className="card p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold">Share your real quote (anonymous)</h2>
      <p className="mt-1 text-sm text-ink-2">Got a quote or finished a project? Tell us what you were charged. We never ask for your name or contact details, and we only publish aggregated numbers.</p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold">Project
          <select name="project" value={proj} onChange={(e) => setProj(e.target.value as typeof proj)} className={input}>
            {PROJECTS.map((x) => <option key={x.key} value={x.key}>{x.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold">ZIP code<input name="zip" required inputMode="numeric" pattern="\d{5}" maxLength={5} className={input} /></label>
        {variantInput && "options" in variantInput && (
          <label className="text-sm font-semibold capitalize">{p.variantNoun}
            <select name="variant" className={input}>{variantInput.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          </label>
        )}
        <label className="text-sm font-semibold">Size <span className="font-normal text-mute">(sq ft, feet, windows, tons or kW)</span><input name="size" className={input} placeholder="e.g. 2,000 sq ft" /></label>
        <label className="text-sm font-semibold">Quoted price (total)<input name="amount" required inputMode="numeric" className={input} placeholder="$" /></label>
        <label className="text-sm font-semibold">Month of the quote<input name="month" type="month" className={input} /></label>
        <label className="text-sm font-semibold">How many quotes did you get?
          <select name="quotes" className={input}>{["1", "2", "3", "4+"].map((x) => <option key={x}>{x}</option>)}</select>
        </label>
        <label className="text-sm font-semibold">What happened?
          <select name="outcome" className={input}>{["Still deciding", "Hired this contractor", "Hired someone else", "Did not do the project"].map((x) => <option key={x}>{x}</option>)}</select>
        </label>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        {status === "error" && <p className="text-sm text-bad sm:col-span-2" role="alert">{error}</p>}
        <button disabled={status === "sending"} className="bg-ink px-5 py-3 font-semibold text-paper disabled:opacity-60 sm:col-span-2 sm:justify-self-start">{status === "sending" ? "Sending…" : "Share anonymously"}</button>
      </form>
    </section>
  );
}
