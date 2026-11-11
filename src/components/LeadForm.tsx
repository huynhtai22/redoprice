"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { LEAD_CONSENT_TEXT, postJSON } from "@/lib/submit";
import { track } from "@/lib/track";

/** Secondary CTA: collapsed by default so it never competes with the content (AdSense-first site). */
export default function LeadForm({ projectKey, projectName, quoteNoun, place }: { projectKey: string; projectName: string; quoteNoun: string; place?: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("company")) return;
    setStatus("sending");
    const res = await postJSON(process.env.NEXT_PUBLIC_LEAD_ENDPOINT, {
      type: "quote-request", project: projectKey,
      timing: fd.get("timing"), name: fd.get("name"), phone: fd.get("phone"), email: fd.get("email") || undefined, zip: fd.get("zip"),
      estimateUrl: window.location.href, consent: fd.get("consent") === "on", consentText: LEAD_CONSENT_TEXT,
      pageUrl: window.location.pathname, userAgent: navigator.userAgent, submittedAt: new Date().toISOString(),
    }, "lead");
    if (res.ok) { setStatus("done"); track("lead_submit", { project: projectKey }); } else { setStatus("error"); setError(res.error); }
  }

  const input = "mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100";
  return (
    <section id="quote-form" data-ad-exclusion-zone className="card p-5 sm:p-6">
      {status === "done" ? (
        <p className="text-center font-semibold" aria-live="polite">Thanks. Up to 3 local {quoteNoun} may reach out, usually within a business day.</p>
      ) : !open ? (
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-lg font-bold">Want real quotes to compare with this estimate?</h2>
            <p className="text-sm text-ink-2">Free and optional. Your estimate link is sent along so pros quote the same job.</p>
          </div>
          <button onClick={() => { setOpen(true); track("lead_open", { project: projectKey, from: "form" }); }} className="shrink-0 rounded-full border border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-white">Get local quotes</button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <h2 className="font-display text-lg font-bold sm:col-span-2">Compare with local {quoteNoun}{place ? ` in ${place}` : ""}</h2>
          <label className="text-sm font-semibold sm:col-span-2">When do you want the {projectName.toLowerCase()} done?
            <select name="timing" required defaultValue="" className={input}>
              <option value="" disabled>Choose one</option>
              {["As soon as possible", "Within 1 to 3 months", "3 to 6 months", "Just researching"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Name<input name="name" required autoComplete="name" className={input} /></label>
          <label className="text-sm font-semibold">ZIP code<input name="zip" required inputMode="numeric" pattern="\d{5}" maxLength={5} autoComplete="postal-code" className={input} /></label>
          <label className="text-sm font-semibold">Phone<input name="phone" type="tel" required autoComplete="tel" className={input} /></label>
          <label className="text-sm font-semibold">Email <span className="font-normal text-mute">(optional)</span><input name="email" type="email" autoComplete="email" className={input} /></label>
          <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <label className="flex gap-2.5 text-xs leading-relaxed text-ink-2 sm:col-span-2">
            <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#f2601d]" />
            <span>{LEAD_CONSENT_TEXT} See our <Link href="/privacy" className="underline">Privacy Policy</Link>.</span>
          </label>
          {status === "error" && <p className="text-sm text-bad sm:col-span-2" role="alert">{error}</p>}
          <button disabled={status === "sending"} className="rounded-full bg-accent-500 px-5 py-3 font-semibold text-white hover:bg-accent-600 disabled:opacity-60 sm:col-span-2 sm:justify-self-start">
            {status === "sending" ? "Sending…" : "Request quotes"}
          </button>
        </form>
      )}
    </section>
  );
}
