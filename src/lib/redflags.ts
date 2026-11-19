/**
 * Red flags for a contractor quote. Pure functions: given the quote, our estimate for the same
 * job in the same ZIP, and (optionally) the quote's own line items, return what to question and
 * what to ask. No numbers here are presented as facts about a specific contractor; every flag is
 * phrased as "check this", with the reason.
 */
import type { Estimate, Project } from "./engine";
import { formatUSD, roundMoney } from "./format";

export type Severity = "high" | "check" | "ok";
export type Flag = { id: string; severity: Severity; title: string; detail: string };
export type LineCheck = { label: string; quoted: number; typical: number; diff: number; ratio: number; severity: Severity };

/** Thresholds, kept in one place so they can be tuned once real shared quotes come in. */
export const THRESHOLDS = {
  /** quote above high * this = high severity */
  wellAboveHigh: 1.15,
  /** quote below low * this = suspiciously low */
  belowLow: 0.9,
  /** a line item above our typical line by this ratio AND by at least minLineDollars is flagged */
  lineRatio: 1.35,
  lineRatioHigh: 1.75,
  minLineDollars: 250,
  /** share of total paid up front above this is a flag */
  depositShare: 1 / 3,
};

export function priceFlags(quote: number, est: Estimate, place: string, noun: string): Flag[] {
  const flags: Flag[] = [];
  const vsTypical = quote / est.typical - 1;
  const overHigh = quote - est.high;
  const pctTxt = `${Math.round(Math.abs(vsTypical) * 100)}%`;

  if (quote > est.high * THRESHOLDS.wellAboveHigh) {
    flags.push({
      id: "price-well-above", severity: "high",
      title: `${pctTxt} above the typical ${noun} price in ${place}`,
      detail: `That is ${formatUSD(roundMoney(overHigh))} over the top of the fair range (${formatUSD(roundMoney(est.high))}). Premium products or a hard job can explain part of it, but ask for an itemized price before you sign and get at least two more quotes.`,
    });
  } else if (quote > est.high) {
    flags.push({
      id: "price-above", severity: "check",
      title: `Above the fair range for ${place}`,
      detail: `${formatUSD(roundMoney(overHigh))} over our high estimate. Ask what you get for the difference: a better product line, a longer labor warranty, or extra work the estimate doesn't include.`,
    });
  } else if (quote < est.low * THRESHOLDS.belowLow) {
    flags.push({
      id: "price-low", severity: "check",
      title: `${pctTxt} below the typical price in ${place}`,
      detail: `A low number is good news only if the scope is the same. Low bids often leave out removal, permits or the product grade you expect, and add them back later as change orders.`,
    });
  } else {
    flags.push({
      id: "price-ok", severity: "ok",
      title: `Inside the fair range for ${place}`,
      detail: `Your total is between ${formatUSD(roundMoney(est.low))} and ${formatUSD(roundMoney(est.high))}. The price is not the issue; check the scope and the terms below.`,
    });
  }
  return flags;
}

/** Compare the user's itemized lines with ours. Lines with no quoted amount are skipped. */
export function lineChecks(est: Estimate, quoted: Record<string, number>, quoteTotal: number): LineCheck[] {
  return est.breakdown
    .filter((l) => quoted[l.label] > 0)
    .map((l) => {
      const q = quoted[l.label];
      const typical = l.value;
      const diff = q - typical;
      const ratio = typical > 0 ? q / typical : Infinity;
      const big = diff >= THRESHOLDS.minLineDollars;
      const severity: Severity = big && ratio >= THRESHOLDS.lineRatioHigh ? "high" : big && ratio >= THRESHOLDS.lineRatio ? "check" : "ok";
      return { label: l.label, quoted: q, typical, diff, ratio, severity };
    })
    .concat(
      // Anything the quote total has that the lines don't explain
      (() => {
        // Only meaningful once every line has been filled in
        if (!est.breakdown.every((l) => l.label in quoted)) return [];
        const sum = Object.values(quoted).reduce((a, b) => a + (b > 0 ? b : 0), 0);
        const gap = quoteTotal - sum;
        return sum > 0 && quoteTotal > 0 && gap > Math.max(THRESHOLDS.minLineDollars, quoteTotal * 0.05)
          ? [{ label: "Not itemized", quoted: gap, typical: 0, diff: gap, ratio: Infinity, severity: "check" as Severity }]
          : [];
      })(),
    );
}

export function depositFlag(deposit: number, quote: number, stateCode: string): Flag | null {
  if (!(deposit > 0) || !(quote > 0)) return null;
  const share = deposit / quote;
  if (stateCode === "CA" && deposit > Math.min(1000, quote * 0.1)) {
    return {
      id: "deposit-ca", severity: "high",
      title: `Deposit of ${formatUSD(deposit)} is more than California allows`,
      detail: "California limits the down payment on most home improvement contracts to $1,000 or 10% of the price, whichever is less (Business and Professions Code 7159.5). Ask the contractor to restructure the payments.",
    };
  }
  if (share > THRESHOLDS.depositShare) {
    return {
      id: "deposit", severity: share > 0.5 ? "high" : "check",
      title: `${Math.round(share * 100)}% of the price is due up front`,
      detail: "Paying more than about a third before work starts leaves you with little leverage. Several states cap home improvement deposits. Ask for payments tied to milestones: materials delivered, work complete, final inspection passed.",
    };
  }
  return { id: "deposit-ok", severity: "ok", title: `Deposit of ${Math.round(share * 100)}% is in the normal range`, detail: "Keep the final payment until the work passes inspection and the site is cleaned up." };
}

/** Line items that most often hide padding, by project. Generic list covers any new project. */
const ITEMS: Partial<Record<string, string[]>> = {
  roofing: [
    "Decking (plywood) replacement priced as a lump sum. Ask for a per-sheet price in writing and photos of every sheet replaced.",
    "A separate dumpster or haul-away fee when tear-off is already on the quote.",
    "Drip edge, ice-and-water shield or ventilation sold as upgrades when local code requires them anyway.",
    "Flashing listed as \"reuse existing\". Old step and chimney flashing is a common leak source on a new roof.",
    "A manufacturer warranty upgrade that only applies if specific accessory products are installed.",
  ],
  solar: [
    "A price per watt quoted before or after the federal tax credit. Make sure you compare like with like.",
    "Electrical panel upgrade added as a line item. Ask whether your panel really needs it.",
    "Dealer fees built into a solar loan. Ask for the cash price and the loan price side by side.",
    "Production guarantees based on an optimistic sun-hours figure for your roof.",
    "Monitoring or maintenance subscriptions bundled into the contract.",
  ],
  hvac: [
    "Equipment size with no load calculation (Manual J). Oversized systems cost more and run worse.",
    "Full ductwork replacement when only sealing or a few runs are needed.",
    "Brand-name equipment listed without the model number, so you can't compare it.",
    "Line set, pad, disconnect or thermostat billed separately after the main price.",
    "\"Extended warranty\" that duplicates the manufacturer's parts warranty.",
  ],
  windows: [
    "Price per window that changes after the measure visit. Ask for the final per-window price in writing.",
    "Full-frame replacement charged where insert windows were discussed (or the other way around).",
    "Trim, capping or interior finishing priced as extras.",
    "Glass package (low-E, argon, triple pane) not specified on the quote.",
    "Lead-safe work fee on a home built after 1978, when it doesn't apply.",
  ],
  fence: [
    "Post depth and post spacing not written down. They decide how long the fence stands.",
    "Gates priced well above the per-foot rate with no hardware listed.",
    "Survey or permit fees you could pull yourself for less.",
    "Removal of the old fence counted twice: once per foot and once as a disposal fee.",
    "Concrete footings listed as an upgrade.",
  ],
};
const GENERIC_ITEMS = [
  "Any line called \"miscellaneous\", \"materials and supplies\" or \"misc. labor\" with no detail.",
  "A permit fee with no permit number promised. Ask who pulls it and to see it before work starts.",
  "Cleanup, disposal or travel charges added on top of a total that already says \"complete\".",
  "Product named only by brand, not by model or line, so you can't compare quotes.",
  "Allowances (\"up to $X for fixtures\") that are lower than what you actually want.",
];
export const itemsToQuestion = (key: Project["key"] | string) => ITEMS[key] ?? GENERIC_ITEMS;

/** Questions to send the contractor. Starts with the ones the flags call for. */
export function questionsToAsk(p: Project, flags: Flag[], lines: LineCheck[]): string[] {
  const q: string[] = [];
  const has = (id: string) => flags.some((f) => f.id === id);
  if (has("price-well-above") || has("price-above"))
    q.push(`Can you send an itemized version of this quote, with materials, labor, removal and permit as separate lines?`,
      `Which exact product and line are you pricing, and what would the price be with a mid-range alternative?`);
  if (has("price-low"))
    q.push(`Does this price include removal, disposal, the permit and all materials? What is not included?`,
      `What happens to the price if you find damage once work starts? What are your unit rates for extra work?`);
  for (const l of lines.filter((x) => x.severity !== "ok"))
    q.push(l.label === "Not itemized"
      ? `About ${formatUSD(roundMoney(l.quoted))} of the total isn't on any line. What does it cover?`
      : `Your ${l.label.toLowerCase()} line is ${formatUSD(roundMoney(l.quoted))}. What goes into it, and can you break it down?`);
  if (has("deposit") || has("deposit-ca"))
    q.push(`Can we tie payments to milestones instead of a large deposit?`);
  q.push(
    `Are you licensed and insured in this state? Please send the license number and certificate of insurance.`,
    `Who pulls the permit, and is the fee included?`,
    `What warranty do you give on labor, in writing, and for how long?`,
    `When can you start, and how many days will the crew be on site?`,
  );
  return Array.from(new Set(q)).slice(0, 9);
}

export const worstSeverity = (flags: { severity: Severity }[]): Severity =>
  flags.some((f) => f.severity === "high") ? "high" : flags.some((f) => f.severity === "check") ? "check" : "ok";
