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
    <div role="dialog" aria-label="Cookie choices" className="fixed inset-x-0 bottom-0 z-50 border-t border-line-2 bg-white px-4 py-3 shadow-[0_-4px_16px_rgb(0_0_0/0.08)] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-xl sm:rounded-md sm:border sm:p-4">
      <p className="text-[15px] leading-snug text-ink-2">
        Cookies help us show ads and count visits. <span className="hidden sm:inline">Your estimate never leaves your browser unless you send it. </span><Link href="/privacy#cookies" className="underline">Details</Link>
      </p>
      <div className="mt-2 flex gap-2 sm:mt-3">
        <button onClick={() => choose(true)} className="min-h-[44px] flex-1 rounded bg-ink px-4 text-[15px] font-semibold text-white sm:flex-none">Accept</button>
        <button onClick={() => choose(false)} className="min-h-[44px] flex-1 rounded border border-line-2 px-4 text-[15px] font-semibold text-ink sm:flex-none">Necessary only</button>
      </div>
    </div>
  );
}
