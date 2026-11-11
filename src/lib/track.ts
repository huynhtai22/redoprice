/**
 * Funnel + engagement events. Pushes to window.dataLayer (GA4 via GTM, or any tag manager).
 * Events: calc_start, calc_change, calc_result_view, quote_check, compare_click,
 * related_click, share_link, lead_open, lead_submit, share_quote_submit.
 */
declare global { interface Window { dataLayer?: Record<string, unknown>[] } }
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  (window.dataLayer = window.dataLayer || []).push({ event, ...params });
}
