"use client";
import { useState } from "react";
import { AD_SLOTS } from "@/lib/ads";
import AdSlot from "./AdSlot";

/** Optional closable 320x50 bottom anchor on mobile. Off unless NEXT_PUBLIC_AD_MOBILE_ANCHOR=true. */
export default function MobileAnchorAd() {
  const [closed, setClosed] = useState(false);
  if (!AD_SLOTS.mobileAnchor.enabled || closed) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] lg:hidden" data-anchor-ad>
      <button onClick={() => setClosed(true)} className="absolute -top-7 right-2 rounded-t-md border border-b-0 border-line bg-white px-2 text-xs text-mute" aria-label="Close ad">✕</button>
      <AdSlot placement="mobileAnchor" />
    </div>
  );
}
