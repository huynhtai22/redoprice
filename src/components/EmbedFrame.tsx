"use client";
import { useEffect } from "react";

/**
 * Inside the iframe: open every link in a new tab (so visitors never browse our site inside
 * someone else's page) and report the content height to the host page for auto-resize.
 */
export default function EmbedFrame() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      e.preventDefault(); e.stopPropagation();
      window.open(a.href, "_blank", "noopener");
    };
    window.addEventListener("click", onClick, true);
    const post = () => window.parent?.postMessage({ type: "redoprice:height", h: document.documentElement.scrollHeight, src: window.location.pathname }, "*");
    const ro = new ResizeObserver(post); ro.observe(document.body); post();
    return () => { window.removeEventListener("click", onClick, true); ro.disconnect(); };
  }, []);
  return null;
}
