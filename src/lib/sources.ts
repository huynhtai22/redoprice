/**
 * The public sources each calculator is built on or checked against, shown in the "Sources" list on every
 * cost page and cited in the page's Article schema. Only list sources we actually use or compare against.
 * `checked` is the date someone last opened the link and confirmed the figure we quote.
 */
import type { Project } from "./engine";

export type Source = { name: string; publisher: string; url: string; use: string; checked: string };

const CHECKED = "2026-11-11";

const COMMON: Source[] = [
  { name: "Occupational Employment and Wage Statistics (OEWS)", publisher: "US Bureau of Labor Statistics", url: "https://www.bls.gov/oes/", use: "Construction trade wages by state and metro area, behind our local labor index.", checked: CHECKED },
  { name: "Producer Price Index", publisher: "US Bureau of Labor Statistics", url: "https://www.bls.gov/ppi/", use: "Price changes for building materials, used to keep material costs current.", checked: CHECKED },
  { name: "American Community Survey", publisher: "US Census Bureau", url: "https://www.census.gov/programs-surveys/acs", use: "Typical home size by state, which sets the default job size in each calculator.", checked: CHECKED },
];

const BY_PROJECT: Record<Project["key"], Source[]> = {
  roofing: [
    { name: "Roof costs soar even as claims decline", publisher: "Verisk, via Insurance Journal (June 22, 2026)", url: "https://www.insurancejournal.com/magazines/mag-features/2026/06/22/874418.htm", use: "Average US residential roof replacement in 2025: $17,631, up 33% on the prior four-year average.", checked: CHECKED },
    { name: "Roofing industry resources", publisher: "National Roofing Contractors Association (NRCA)", url: "https://www.nrca.net/", use: "Installation practice: tear-off, underlayment, waste allowance and roof measurement.", checked: CHECKED },
  ],
  hvac: [
    { name: "Heating and cooling guidance", publisher: "ENERGY STAR (US EPA)", url: "https://www.energystar.gov/products/heating_cooling", use: "Efficiency tiers (SEER2, HSPF2, AFUE) that separate standard and high-efficiency systems.", checked: CHECKED },
    { name: "Electric Power Monthly", publisher: "US Energy Information Administration", url: "https://www.eia.gov/electricity/monthly/", use: "Residential electricity prices by state, used for running-cost estimates.", checked: CHECKED },
  ],
  solar: [
    { name: "Tracking the Sun", publisher: "Lawrence Berkeley National Laboratory", url: "https://emp.lbl.gov/tracking-the-sun", use: "Installed price per watt for residential solar.", checked: CHECKED },
    { name: "PVWatts Calculator", publisher: "National Renewable Energy Laboratory", url: "https://pvwatts.nrel.gov/", use: "Yearly output per kW of panels by location.", checked: CHECKED },
    { name: "Electric Power Monthly", publisher: "US Energy Information Administration", url: "https://www.eia.gov/electricity/monthly/", use: "Residential electricity prices by state, used for savings and payback.", checked: CHECKED },
    { name: "Residential Clean Energy Credit", publisher: "Internal Revenue Service", url: "https://www.irs.gov/credits-deductions/residential-clean-energy-credit", use: "Status of the federal solar tax credit.", checked: CHECKED },
  ],
  windows: [
    { name: "Residential windows, doors and skylights", publisher: "ENERGY STAR (US EPA)", url: "https://www.energystar.gov/products/residential_windows_doors_and_skylights", use: "Efficiency ratings that separate standard and premium glazing.", checked: CHECKED },
  ],
  fence: [],
};

export const sourcesFor = (p: Project): Source[] => [...BY_PROJECT[p.key], ...COMMON];

/**
 * "Why is our number higher than theirs?" Published headline averages on the cost pages that rank for
 * the same search, as they read when checked. Only projects where we have checked them get a box.
 */
export type PriceCheck = {
  others: { name: string; figure: number; url: string; note?: string }[];
  anchor: { name: string; figure: number; url: string };
  reasons: string[];
  checked: string;
};

export const PRICE_CHECK: Partial<Record<Project["key"], PriceCheck>> = {
  roofing: {
    others: [
      { name: "Angi", figure: 9511, url: "https://angi.com/articles/how-much-does-roof-replacement-cost.htm" },
      { name: "NerdWallet", figure: 9500, url: "https://www.nerdwallet.com/home-ownership/home-improvement/learn/roof-replacement-cost", note: "citing Angi" },
      { name: "Fixr", figure: 10000, url: "https://www.fixr.com/costs/roof-replacement" },
      { name: "HomeGuide", figure: 10800, url: "https://homeguide.com/costs/roof-replacement-cost" },
    ],
    anchor: { name: "Verisk 2025 insurance data", figure: 17631, url: "https://www.insurancejournal.com/magazines/mag-features/2026/06/22/874418.htm" },
    reasons: [
      "Roof prices rose fast. Verisk's 2025 insurance data puts the average US residential roof replacement at $17,631, 33% above its average for the four years before. Survey averages collected before that jump read low today.",
      "We price a whole job: the full sloped roof area including overhangs, tear-off and disposal of the old layer, and the permit. Survey and marketplace averages can include smaller homes, overlays and partial jobs.",
      "Every number here comes from a model you can check. Change the inputs, and the breakdown shows where each dollar goes.",
    ],
    checked: "2026-11-11",
  },
};
