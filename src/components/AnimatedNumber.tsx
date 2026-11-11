"use client";
import { useEffect, useRef, useState } from "react";
import { formatUSD } from "@/lib/format";

export default function AnimatedNumber({ value, format = formatUSD, duration = 420 }: { value: number; format?: (n: number) => string; duration?: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setShown(value); from.current = value; return; }
    const start = performance.now(); const a = from.current; let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration); const v = a + (value - a) * (1 - Math.pow(1 - p, 3));
      setShown(v); from.current = v; if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className="tnum">{format(shown)}</span>;
}
