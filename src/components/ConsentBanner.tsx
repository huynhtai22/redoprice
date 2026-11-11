"use client";
/**
 * Lightweight consent banner wired to Google Consent Mode v2.
 * Defaults (set in layout <head>): ad storage DENIED in EEA/UK/CH, GRANTED elsewhere.
 * The banner lets anyone change their choice; the choice is remembered in localStorage.
 *
 * For EEA/UK traffic Google requires a Google-certified CMP. When you enable one
 * (AdSense > Privacy & messaging > European regulations), set NEXT_PUBLIC_CMP=google
 * and this banner hides itself so the two never stack.
 */
import { useEffect, useState } from "react";
import Link from "next/link";

type Gtag = (...args: unknown[]) => void;
const KEY = "rp-consent";

function update(granted: boolean) {
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  const v = granted ? "granted" : "denied";
  g?.("consent", "update", { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v });
}

export default function ConsentBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_CMP === "google") return;
    let saved: string | null = null;
    try { saved = localStorage.getItem(KEY); } catch { /* private mode */ }
    if (saved) update(saved === "granted"); else setShow(true);
    const open = () => setShow(true);
    window.addEventListener("rp-open-consent", open);
    return () => window.removeEventListener("rp-open-consent", open);
  }, []);
  const choose = (granted: boolean) => {
    try { localStorage.setItem(KEY, granted ? "granted" : "denied"); } catch { /* ignore */ }
    update(granted); setShow(false);
  };
  if (!show) return null;
  return (
    <div role="dialog" aria-label="Cookie choices" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-line bg-white p-4 shadow-xl sm:inset-x-auto sm:left-4">
      <p className="text-sm leading-relaxed text-ink-2">
        We use cookies to show ads and measure how the calculators are used. Your estimate never leaves your browser
        unless you send it. <Link href="/privacy#cookies" className="underline">Learn more</Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => choose(true)} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Accept</button>
        <button onClick={() => choose(false)} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">Necessary only</button>
      </div>
    </div>
  );
}
