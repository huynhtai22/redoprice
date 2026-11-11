"use client";
import { useState } from "react";
import { PROJECTS } from "@/lib/projects";
import { SITE } from "@/lib/site";
import { track } from "@/lib/track";

const HEIGHT: Record<string, number> = { roofing: 820, solar: 760, hvac: 760, windows: 760, fence: 780 };

export function snippet(slug: string, key: string, name: string, autoResize: boolean) {
  const url = `${SITE.url}/embed/${slug}`;
  const lines = [
    `<iframe data-redoprice src="${url}" title="${name}" width="100%" height="${HEIGHT[key] ?? 800}" loading="lazy" style="border:1px solid #d8cfbf;max-width:980px;display:block"></iframe>`,
    `<p style="font-size:13px;margin:6px 0 0">${name.replace(/ Calculator$/, " calculator")} by <a href="${SITE.url}/${slug}">${SITE.name}</a></p>`,
  ];
  if (autoResize) lines.push(`<script async src="${SITE.url}/widget.js"></script>`);
  return lines.join("\n");
}

export default function WidgetBuilder() {
  const [slug, setSlug] = useState(PROJECTS[0].slug);
  const [auto, setAuto] = useState(true);
  const [copied, setCopied] = useState(false);
  const p = PROJECTS.find((x) => x.slug === slug)!;
  const code = snippet(p.slug, p.key, p.calculatorName, auto);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <div className="min-w-0">
        <label htmlFor="w-project" className="text-[15px] font-semibold">Calculator</label>
        <select id="w-project" value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1.5 w-full border border-line-2 bg-white px-3 py-2.5 text-base">
          {PROJECTS.map((x) => <option key={x.slug} value={x.slug}>{x.calculatorName}</option>)}
        </select>
        <label className="mt-4 flex items-start gap-2.5 text-[15px]">
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="mt-1 h-4 w-4" />
          <span>Auto-resize the frame <span className="block text-[13px] text-mute">Adds one small script. Leave it off if your site strips scripts (some WordPress setups do).</span></span>
        </label>
        <p className="mt-6 text-[15px] font-semibold">Paste this where the calculator should appear</p>
        <textarea readOnly value={code} rows={8} onFocus={(e) => e.currentTarget.select()} className="mt-1.5 w-full border border-ink bg-paper p-3 font-mono text-[12.5px] leading-relaxed" aria-label="Embed code" />
        <button onClick={async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ } track("widget_copy", { project: p.key }); }}
          className="mt-2 bg-ink px-4 py-2.5 font-semibold text-paper hover:bg-ink-2">{copied ? "Copied" : "Copy embed code"}</button>
        <p className="mt-3 text-[13px] text-mute">Keep the credit line under the frame. It is how the widget stays free.</p>
      </div>
      <div className="min-w-0">
        <p className="label">Live preview</p>
        <iframe key={slug} src={`/embed/${slug}`} title={`${p.calculatorName} preview`} className="mt-2 block w-full border border-line-2 bg-canvas" style={{ height: HEIGHT[p.key] ?? 800 }} loading="lazy" />
      </div>
    </div>
  );
}
