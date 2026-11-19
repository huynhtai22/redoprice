/**
 * One source of truth for the numbers on a cost page. The intro, title tag, FAQ answer, tables, charts
 * and every JSON-LD block read from this, so the visible page and its schema can never disagree.
 */
import { NATIONAL_REGION, regionFor, type MetroRow, type StateRow } from "./data";
import type { Estimate, FAQ, Project, Variant } from "./engine";
import { formatNum, formatUSD, formatUSD2, roundMoney } from "./format";
import { SITE } from "./site";

export type PageNumbers = ReturnType<typeof pageNumbers>;

const usd = (n: number) => formatUSD(roundMoney(n));
const perUnit = (e: Estimate) => e.perUnit && `${e.perUnit.value < 50 ? formatUSD2(e.perUnit.value) : formatUSD(e.perUnit.value)} per ${e.perUnit.unit}`;

export function pageNumbers(p: Project, state?: StateRow, metro?: MetroRow, variant?: Variant) {
  const region = state ? regionFor(state, metro) : NATIONAL_REGION;
  const place = metro ? `${metro.name}, ${state!.code}` : state?.name;
  const defaults = p.defaults(region);
  const preset = variant ? variant.preset ?? { [p.variantKey]: variant.value } : undefined;
  const jobInputs = { ...defaults, ...preset };
  const typicalJob = p.compute(jobInputs, region);
  const national = p.compute(p.defaults(NATIONAL_REGION), NATIONAL_REGION);
  const nationalJob = p.compute({ ...p.defaults(NATIONAL_REGION), ...preset }, NATIONAL_REGION);
  const path = `/${p.slug}${variant ? `/${variant.slug}` : ""}${state ? `/${state.slug}` : ""}${metro ? `/${metro.slug}` : ""}`;

  // Plain-English description of the default job ("1,800 sq ft home, Architectural shingles, 1 story")
  const assumes = p.inputs(region).slice(0, 3).map((inp) => `${inp.label.toLowerCase()}: ${inp.type === "slider"
    ? `${inp.prefix ?? ""}${formatNum(Number(jobInputs[inp.key]))} ${inp.unit}`.replace(" /", "/")
    : inp.options.find((o) => o.value === String(jobInputs[inp.key]))?.label.toLowerCase() ?? String(jobInputs[inp.key])}`).join("; ");

  const jobNoun = variant ? variant.label.toLowerCase() : p.noun;
  const where = place ? `in ${place}` : "in the US";
  const priceAnswer = `A typical ${jobNoun} job ${where} costs about ${usd(typicalJob.typical)}, and most fair quotes fall between ${usd(typicalJob.low)} and ${usd(typicalJob.high)}`
    + `${perUnit(typicalJob) ? ` (about ${perUnit(typicalJob)})` : ""}. It assumes ${assumes}. Enter your ZIP code and your own details in the calculator above for your number.`;

  // The first FAQ on every project is its "how much does it cost" question. Its answer is generated here,
  // never written by hand, so it always matches the intro and the calculator.
  const faqs: FAQ[] = p.faqs.map((f, i) => (i === 0 ? { q: f.q, a: priceAnswer } : f));

  return { region, place, defaults, preset, typicalJob, national, nationalJob, path, url: `${SITE.url}${path}`, faqs, usd };
}
