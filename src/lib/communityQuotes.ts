/**
 * Real quotes shared by homeowners, published only after moderation and only in aggregate-safe form.
 *
 * Privacy rules (enforced here, not just in the moderation script):
 *  - only rows with status "approved" are read
 *  - an area is shown only when it has at least `minSample` approved quotes for that project
 *  - location is a 3-digit ZIP prefix or a state, never a full ZIP
 *  - amounts are rounded, dates are month-only, and there is no free text or contact field
 */
import raw from "@/data/community-quotes.json";
import { STATES } from "./data";
import { projectByKey } from "./projects";

export type QuoteStatus = "pending" | "approved" | "rejected";
export type CommunityQuote = {
  id: string;
  project: string;
  zip3: string;
  state: string;
  variant?: string;
  size?: string;
  amount: number;
  month: string; // YYYY-MM
  outcome?: string;
  status: QuoteStatus;
  flags?: string[];
};

const DATA = raw as unknown as { minSample: number; quotes: CommunityQuote[] };
export const MIN_SAMPLE = DATA.minSample;
const APPROVED = DATA.quotes.filter((q) => q.status === "approved");

export type PublicQuote = { id: string; amount: number; month: string; variant?: string; size?: string; outcome?: string };
export type AreaQuotes = {
  level: "zip3" | "state";
  areaLabel: string;
  n: number;
  enough: boolean;
  needed: number;
  quotes: PublicQuote[];
  stats?: { p25: number; median: number; p75: number };
  /** The band covers only quotes for the same material/system as the user's job */
  comparable: boolean;
  comparableLabel?: string;
};

const roundShown = (n: number) => (n < 2000 ? Math.round(n / 50) * 50 : Math.round(n / 100) * 100);
const quantile = (s: number[], q: number) => {
  const pos = (s.length - 1) * q; const lo = Math.floor(pos); const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
};
const fmtMonth = (m: string) => {
  const [y, mo] = m.split("-").map(Number);
  return y && mo ? new Date(Date.UTC(y, mo - 1, 1)).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }) : "";
};

function build(rows: CommunityQuote[], level: AreaQuotes["level"], areaLabel: string, variant?: string): AreaQuotes {
  const n = rows.length;
  const enough = n >= MIN_SAMPLE;
  if (!enough) return { level, areaLabel, n, enough, needed: MIN_SAMPLE - n, quotes: [], comparable: false };
  const p = projectByKey(rows[0].project);
  const label = (v?: string) => (v && p ? p.variants.find((x) => x.value === v)?.label ?? undefined : undefined);
  // The band is only a fair yardstick for the same material/system. Use that subset when it is big enough.
  const same = variant ? rows.filter((r) => r.variant === variant) : [];
  const comparable = same.length >= MIN_SAMPLE;
  const sorted = (comparable ? same : rows).map((r) => r.amount).sort((a, b) => a - b);
  return {
    level, areaLabel, n, enough, needed: 0, comparable, comparableLabel: comparable ? label(variant) : undefined,
    stats: { p25: roundShown(quantile(sorted, 0.25)), median: roundShown(quantile(sorted, 0.5)), p75: roundShown(quantile(sorted, 0.75)) },
    quotes: [...rows]
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 8)
      .map((r) => ({ id: r.id, amount: roundShown(r.amount), month: fmtMonth(r.month), variant: label(r.variant), size: r.size, outcome: r.outcome })),
  };
}

/**
 * Best area with enough quotes: the ZIP3 if it qualifies, otherwise the state.
 * If neither qualifies, returns the state (or ZIP3) with `enough: false` and how many are still needed.
 */
export function quotesForArea(projectKey: string, opts: { zip?: string; stateCode?: string; variant?: string }): AreaQuotes | null {
  const forProject = APPROVED.filter((q) => q.project === projectKey);
  const zip3 = opts.zip && /^\d{5}$/.test(opts.zip) ? opts.zip.slice(0, 3) : undefined;
  const stateCode = opts.stateCode && opts.stateCode !== "US" ? opts.stateCode : undefined;
  const st = stateCode ? STATES.find((s) => s.code === stateCode) : undefined;

  const byZip = zip3 ? build(forProject.filter((q) => q.zip3 === zip3), "zip3", `ZIP codes ${zip3}xx`, opts.variant) : null;
  if (byZip?.enough) return byZip;
  const byState = st ? build(forProject.filter((q) => q.state === st.code), "state", st.name, opts.variant) : null;
  if (byState?.enough) return byState;
  return byState ?? byZip;
}

/** Counts per project/state, used by the indexing rollout to promote pages with real data. */
export function approvedCount(projectKey: string, stateCode: string) {
  return APPROVED.filter((q) => q.project === projectKey && q.state === stateCode).length;
}
