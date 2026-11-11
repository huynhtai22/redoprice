/**
 * Build labor indexes from a BLS OEWS CSV export (state or metro file).
 * Usage: npm run import:oews -- path/to/oews.csv
 * Uses construction trade occupations and the hourly mean wage (H_MEAN), weighted by employment (TOT_EMP).
 * Prints { AREA_TITLE: index } where 1.00 = national weighted mean. Paste results into src/data/<release>/.
 */
import { readFileSync } from "node:fs";

const TRADES = ["47-2181", "47-2031", "47-2111", "47-2152", "49-9021", "47-2061"]; // roofers, carpenters, electricians, plumbers, HVAC mechanics, construction laborers
const file = process.argv[2];
if (!file) { console.error("Pass the OEWS CSV path"); process.exit(1); }
const [head, ...rows] = readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map((l) => l.split(","));
const col = (n: string) => head.findIndex((h) => h.replace(/"/g, "").toUpperCase() === n);
const [A, O, W, E] = ["AREA_TITLE", "OCC_CODE", "H_MEAN", "TOT_EMP"].map(col);
const num = (s: string) => Number(String(s).replace(/[",*#]/g, ""));
const areas = new Map<string, { w: number; e: number }>();
let natW = 0, natE = 0;
for (const r of rows) {
  const occ = r[O]?.replace(/"/g, "");
  if (!TRADES.includes(occ)) continue;
  const w = num(r[W]), e = num(r[E]);
  if (!w || !e) continue;
  const a = r[A].replace(/"/g, "");
  const cur = areas.get(a) ?? { w: 0, e: 0 };
  cur.w += w * e; cur.e += e; areas.set(a, cur);
  natW += w * e; natE += e;
}
const nat = natW / natE;
console.log(JSON.stringify(Object.fromEntries([...areas].map(([a, v]) => [a, Math.round((v.w / v.e / nat) * 100) / 100])), null, 1));
