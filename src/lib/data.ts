/**
 * Single entry point for all cost data. Data lives in versioned JSON files under
 * src/data/<YYYY-MM>/ so every number on the site can be traced to a dataset,
 * a source list and an "updated" date. To ship a new data release, copy the folder,
 * update the numbers + meta, and change DATA_VERSION_DIR imports below.
 */
import regional from "@/data/2026-11/regional-index.json";
import metroData from "@/data/2026-11/metro-index.json";
import energy from "@/data/2026-11/energy-solar.json";
import housing from "@/data/2026-11/housing-defaults.json";
import national from "@/data/2026-11/national-costs.json";
import laborWages from "@/data/2026-11/labor-wages.json";
import spotChecks from "@/data/2026-11/material-spot-checks.json";

/** A citable public source behind a dataset. */
export type SourceRef = { label: string; publisher: string; url: string; period: string };

export type DatasetMeta = {
  dataset: string;
  version: string;
  updated: string;
  /**
   * "estimate" = hand-set placeholder pending import from a public source
   * "partial"  = some fields imported from a public source, others still estimates
   * "sourced"  = imported from the public source listed in refs
   * "model"    = RedoPrice's own cost model, cross-checked against refs
   * "verified" = sourced and checked by a named reviewer
   */
  status: "estimate" | "partial" | "sourced" | "model" | "verified";
  sources: string[];
  refs?: SourceRef[];
  notes: string;
};

export const STATUS_LABEL: Record<DatasetMeta["status"], string> = {
  estimate: "Modeled estimate",
  partial: "Partly sourced",
  sourced: "Public data",
  model: "Cost model",
  verified: "Reviewed",
};

export type StateRow = {
  code: string; name: string; slug: string;
  laborIndex: number; materialIndex: number;
  climate: string[]; zip3: number[][];
};
export type MetroRow = { slug: string; name: string; state: string; laborIndex: number; rank: number };

export const STATES = regional.states as StateRow[];
export const METROS = metroData.metros as MetroRow[];
export const ENERGY = energy as unknown as {
  meta: DatasetMeta;
  residentialCentsPerKwh: Record<string, number>;
  solarKwhPerKwYear: Record<string, number>;
};
export const HOUSING = housing as unknown as { meta: DatasetMeta; typicalHomeSqft: Record<string, number> };
export const NATIONAL = national;

export type TradeWage = { mean: number | null; median: number | null; emp: number | null };
export const LABOR_WAGES = laborWages as unknown as {
  meta: DatasetMeta;
  trades: Record<string, string>;
  us: Record<string, TradeWage>;
  states: Record<string, Record<string, TradeWage>>;
  metros: Record<string, Record<string, TradeWage>>;
};
export const SPOT_CHECKS = spotChecks as unknown as {
  meta: DatasetMeta;
  items: { project: string; material: string; item: string; retailer: string; url: string; listingUnit: string; unitsPerCalcUnit: number; price: number | null; storeZip: string | null; checked: string | null }[];
};

export const DATASETS: DatasetMeta[] = [
  national.meta as DatasetMeta,
  regional.meta as DatasetMeta,
  metroData.meta as DatasetMeta,
  energy.meta as DatasetMeta,
  housing.meta as DatasetMeta,
  laborWages.meta as DatasetMeta,
  spotChecks.meta as DatasetMeta,
];

export const getDataset = (name: string) => DATASETS.find((d) => d.dataset === name);

/** Datasets that feed a given calculator, in the order shown in its Sources block. */
export function datasetsFor(projectKey?: string): DatasetMeta[] {
  const names = ["national-costs", "regional-index", "metro-index", "labor-wages"];
  if (projectKey === "solar" || projectKey === "hvac") names.push("energy-and-solar");
  if (projectKey === "hvac" || projectKey === "roofing") names.push("housing-defaults");
  names.push("material-spot-checks");
  return names.map(getDataset).filter((d): d is DatasetMeta => !!d && (d.dataset !== "labor-wages" || d.status !== "estimate"));
}

/** True while any dataset is still an estimate. Drives the "estimated data" labels in the UI. */
export const DATA_IS_ESTIMATE = DATASETS.some((d) => d.status === "estimate" || d.status === "partial");
export const DATA_UPDATED = DATASETS.map((d) => d.updated).sort().at(-1)!;
export const DATA_VERSION = national.meta.version;

export const getState = (slugOrCode: string) =>
  STATES.find((s) => s.slug === slugOrCode || s.code === slugOrCode.toUpperCase());
export const getMetro = (stateSlug: string, metroSlug: string) => {
  const st = getState(stateSlug);
  return st ? METROS.find((m) => m.slug === metroSlug && m.state === st.code) : undefined;
};
export const metrosInState = (code: string) => METROS.filter((m) => m.state === code);

/** ZIP -> state using the first three digits. */
export function stateFromZip(zip: string): StateRow | undefined {
  if (!/^\d{5}$/.test(zip)) return undefined;
  const z3 = Number(zip.slice(0, 3));
  return STATES.find((s) => s.zip3.some(([a, b]) => z3 >= a && z3 <= b));
}

export type Region = {
  state: StateRow;
  metro?: MetroRow;
  laborIndex: number;
  materialIndex: number;
  label: string;
};

export function regionFor(state: StateRow, metro?: MetroRow): Region {
  return {
    state, metro,
    laborIndex: metro?.laborIndex ?? state.laborIndex,
    materialIndex: state.materialIndex,
    label: metro ? `${metro.name}, ${state.code}` : state.name,
  };
}

export const NATIONAL_REGION: Region = {
  state: { code: "US", name: "United States", slug: "us", laborIndex: 1, materialIndex: 1, climate: [], zip3: [] },
  laborIndex: 1, materialIndex: 1, label: "US average",
};
