"use client";
/**
 * Reserved, lazy-loaded AdSense slot. Configure in src/lib/ads.ts.
 * - Always reserves its height (no layout shift), even before the ad loads.
 * - Lazy slots only request an ad when within ~300px of the viewport.
 * - With no NEXT_PUBLIC_ADSENSE_CLIENT set, renders a labelled placeholder for layout review.
 */
import { useEffect, useRef, useState } from "react";
import { AD_SLOTS, ADSENSE_CLIENT, type Placement } from "@/lib/ads";

declare global { interface Window { adsbygoogle?: unknown[] } }

const DEVICE_CLS = { all: "", desktop: "hidden lg:block", mobile: "lg:hidden" } as const;

export default function AdSlot({ placement, className = "" }: { placement: Placement; className?: string }) {
  const cfg = AD_SLOTS[placement];
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!cfg.lazy);
  const pushed = useRef(false);
  const live = Boolean(ADSENSE_CLIENT && cfg.slotId);

  useEffect(() => {
    if (visible || !ref.current) return;
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { setVisible(true); io.disconnect(); } }, { rootMargin: "300px 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!live || !visible || pushed.current) return;
    pushed.current = true;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* blocked */ }
  }, [live, visible]);

  if (!cfg.enabled) return null;
  const style = { "--ad-h-m": `${cfg.minHeight.mobile}px`, "--ad-h-d": `${cfg.minHeight.desktop}px` } as React.CSSProperties;

  return (
    <aside ref={ref} style={style} data-ad-placement={placement} aria-label="Advertisement"
      className={`ad-slot ${DEVICE_CLS[cfg.devices]} ${className}`}>
      <p className="mb-1 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-mute/80">Advertisement</p>
      {live ? (
        visible && (
          <ins className="adsbygoogle block" style={{ display: "block" }} data-ad-client={ADSENSE_CLIENT} data-ad-slot={cfg.slotId}
            data-ad-format={placement === "sidebar" ? "vertical" : "auto"} data-full-width-responsive="true" />
        )
      ) : (
        <div style={style} className="ad-slot grid place-items-center rounded-xl border border-dashed border-ink/15 bg-white/60 text-xs font-medium text-mute">
          Ad slot · {placement}
        </div>
      )}
    </aside>
  );
}
