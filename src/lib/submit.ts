/**
 * Pluggable form endpoints (Formspree, Zapier/Make/n8n webhook, Google Apps Script, your own API).
 *   NEXT_PUBLIC_LEAD_ENDPOINT        "Compare with local pros" quote requests (secondary CTA)
 *   NEXT_PUBLIC_QUOTE_DATA_ENDPOINT  anonymous "Share your real quote" submissions (first-party data)
 * With no endpoint set, submissions are logged to the console so the forms still work in preview.
 */
export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function postJSON(endpoint: string | undefined, payload: unknown, label: string): Promise<SubmitResult> {
  if (!endpoint) {
    console.info(`[${label}] no endpoint configured; not sent`, payload);
    return { ok: true };
  }
  try {
    const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
    return res.ok ? { ok: true } : { ok: false, error: `Something went wrong (${res.status}). Please try again.` };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

export const LEAD_CONSENT_TEXT =
  "I agree that RedoPrice and up to 3 independent contractors or partner networks may contact me by phone (including automated calls or texts) and email about my project. Consent is not a condition of purchase. RedoPrice may be paid by the pros it connects you with.";
