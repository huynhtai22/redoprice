/**
 * Shareable cost sheets rendered with next/og (Satori). Two formats:
 *  - "og":  1200x630, used as og:image / twitter:image for hub, material, state and city pages
 *  - "pin": 1000x1500, a tall Pinterest pin with the cost-by-material table
 * Deliberately plain: one serif for figures, one sans for text, ink on off-white, one accent.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { Project, Variant } from "../engine";
import { NATIONAL_REGION, type Region } from "../data";
import { DATA_IS_ESTIMATE, DATA_UPDATED } from "../data";
import { formatUSD, roundMoney } from "../format";
import { SITE } from "../site";

const C = { bg: "#faf8f4", ink: "#1d2427", ink2: "#4a5357", mute: "#7a8082", line: "#d9d4ca", accent: "#1e4a72", band: "#e3e9ef" };

let fontsP: Promise<{ name: string; data: Buffer; weight: 400 | 600 | 700; style: "normal" }[]> | null = null;
const fonts = () =>
  (fontsP ??= Promise.all([
    readFile(join(process.cwd(), "src/lib/og/fonts/serif-700.ttf")).then((data) => ({ name: "Serif", data, weight: 700 as const, style: "normal" as const })),
    readFile(join(process.cwd(), "src/lib/og/fonts/sans-400.ttf")).then((data) => ({ name: "Sans", data, weight: 400 as const, style: "normal" as const })),
    readFile(join(process.cwd(), "src/lib/og/fonts/sans-600.ttf")).then((data) => ({ name: "Sans", data, weight: 600 as const, style: "normal" as const })),
  ]));

const usd = (n: number) => formatUSD(roundMoney(n));
const month = new Date(DATA_UPDATED + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });

export type CardInput = { p: Project; region?: Region; variant?: Variant };

function data({ p, region = NATIONAL_REGION, variant }: CardInput) {
  const preset = variant ? variant.preset ?? { [p.variantKey]: variant.value } : {};
  const est = p.compute({ ...p.defaults(region), ...preset }, region);
  const place = region.state.code === "US" ? "US average" : region.label;
  const subject = variant ? `${variant.label}` : p.name;
  const byVariant = p.key === "solar" ? [] : p.variants
    .map((v) => ({ v, e: p.compute({ ...p.defaults(region), ...(v.preset ?? { [p.variantKey]: v.value }) }, region) }))
    .sort((a, b) => a.e.typical - b.e.typical)
    .slice(0, 7);
  return { est, place, subject, byVariant };
}

function Header() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `2px solid ${C.ink}`, paddingBottom: 18 }}>
      <div style={{ display: "flex", fontFamily: "Serif", fontSize: 36, fontWeight: 700, color: C.ink }}>{SITE.name}</div>
      <div style={{ display: "flex", fontSize: 22, color: C.ink2 }}>{`Cost data · ${month}`}</div>
    </div>
  );
}

function RangeBar({ low, typical, high, width }: { low: number; typical: number; high: number; width: number }) {
  const lo = low * 0.8; const hi = high * 1.1;
  const x = (n: number) => ((n - lo) / (hi - lo)) * width;
  return (
    <div style={{ display: "flex", flexDirection: "column", width }}>
      <div style={{ display: "flex", position: "relative", width, height: 28 }}>
        <div style={{ position: "absolute", left: 0, top: 13, width, height: 2, background: C.line }} />
        <div style={{ position: "absolute", left: x(low), top: 4, width: x(high) - x(low), height: 20, background: C.band, borderLeft: `2px solid ${C.accent}`, borderRight: `2px solid ${C.accent}` }} />
        <div style={{ position: "absolute", left: x(typical) - 2, top: 0, width: 4, height: 28, background: C.ink }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", width, marginTop: 8, fontSize: 20, color: C.ink2 }}>
        <span>{`Low ${usd(low)}`}</span><span>{`High ${usd(high)}`}</span>
      </div>
    </div>
  );
}

function Rows({ rows, size = 24 }: { rows: { k: string; v: string; strong?: boolean }[]; size?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {rows.map((r) => (
        <div key={r.k} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.line}`, padding: "12px 0", fontSize: size, color: r.strong ? C.ink : C.ink2, fontWeight: r.strong ? 600 : 400 }}>
          <span>{r.k}</span><span style={{ color: C.ink, fontWeight: 600 }}>{r.v}</span>
        </div>
      ))}
    </div>
  );
}

const footnote = () => `${DATA_IS_ESTIMATE ? "Modeled estimate" : "Estimate"} adjusted for local labor and material prices. Not a quote.`;

export async function costCard(input: CardInput, format: "og" | "pin") {
  const { est, place, subject, byVariant } = data(input);
  const breakdown = est.breakdown.map((l) => ({ k: l.label, v: usd(l.value) }));
  const opts = { fonts: await fonts(), headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" } };

  if (format === "og") {
    return new ImageResponse(
      (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: C.bg, padding: "48px 64px", fontFamily: "Sans", color: C.ink }}>
          <Header />
          <div style={{ display: "flex", flex: 1, marginTop: 34, gap: 64 }}>
            <div style={{ display: "flex", flexDirection: "column", width: 560 }}>
              <div style={{ display: "flex", fontSize: 26, color: C.ink2 }}>{`${subject} cost · ${place}`}</div>
              <div style={{ display: "flex", fontFamily: "Serif", fontWeight: 700, fontSize: 124, lineHeight: 1, marginTop: 14, letterSpacing: -2 }}>{usd(est.typical)}</div>
              <div style={{ display: "flex", fontSize: 24, color: C.ink2, marginTop: 14 }}>Typical job, with the fair range below</div>
              <div style={{ display: "flex", marginTop: 34 }}><RangeBar low={est.low} typical={est.typical} high={est.high} width={540} /></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", fontSize: 20, color: C.mute, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Where the money goes</div>
              <Rows rows={[...breakdown, { k: "Total, typical", v: usd(est.typical), strong: true }]} size={23} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${C.line}`, paddingTop: 16, fontSize: 19, color: C.mute }}>
            <span>{footnote()}</span><span style={{ color: C.accent, fontWeight: 600 }}>{`${SITE.domain}`}</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630, ...opts },
    );
  }

  const title = `What ${input.variant ? input.variant.label.toLowerCase() : `a new ${input.p.noun}`} costs in ${place === "US average" ? "the US" : place}`;
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: C.bg, padding: "64px 72px", fontFamily: "Sans", color: C.ink }}>
        <Header />
        <div style={{ display: "flex", fontFamily: "Serif", fontWeight: 700, fontSize: 64, lineHeight: 1.08, marginTop: 48 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 26, color: C.ink2, marginTop: 40 }}>Typical job</div>
        <div style={{ display: "flex", fontFamily: "Serif", fontWeight: 700, fontSize: 132, lineHeight: 1, marginTop: 8, letterSpacing: -2 }}>{usd(est.typical)}</div>
        <div style={{ display: "flex", marginTop: 32 }}><RangeBar low={est.low} typical={est.typical} high={est.high} width={856} /></div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 44 }}>
          <div style={{ display: "flex", fontSize: 20, color: C.mute, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>{byVariant.length > 1 ? `Typical cost by ${input.p.variantNoun}` : "Where the money goes"}</div>
          <Rows rows={byVariant.length > 1 ? byVariant.map(({ v, e }) => ({ k: v.label, v: usd(e.typical), strong: v.value === input.variant?.value })) : breakdown} size={byVariant.length > 5 ? 24 : 27} />
        </div>
        {byVariant.length > 1 && (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 36 }}>
            <div style={{ display: "flex", fontSize: 20, color: C.mute, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Where the money goes, typical job</div>
            <div style={{ display: "flex", flexWrap: "wrap", fontSize: 24, color: C.ink2, gap: "10px 36px", paddingTop: 10 }}>
              {breakdown.map((r) => <span key={r.k} style={{ display: "flex" }}>{`${r.k} `}<span style={{ color: C.ink, fontWeight: 600, marginLeft: 8 }}>{r.v}</span></span>)}
            </div>
          </div>
        )}
        <div style={{ display: "flex", flex: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", borderTop: `2px solid ${C.ink}`, paddingTop: 22 }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600 }}>{`Check your own quote free at ${SITE.domain}`}</div>
          <div style={{ display: "flex", fontSize: 20, color: C.mute, marginTop: 8 }}>{footnote()}</div>
        </div>
      </div>
    ),
    { width: 1000, height: 1500, ...opts },
  );
}
