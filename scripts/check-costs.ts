/** Sanity checks for the cost engine: run `npm run check:costs`. */
import { PROJECTS } from "../src/lib/projects";
import { STATES, regionFor, NATIONAL_REGION } from "../src/lib/data";
let fail = 0;
for (const p of PROJECTS) for (const r of [NATIONAL_REGION, ...STATES.map((s) => regionFor(s))]) {
  const e = p.compute(p.defaults(r), r);
  if (!(e.low > 0 && e.low <= e.typical && e.typical <= e.high)) { fail++; console.error(p.key, r.label, e.low, e.typical, e.high); }
  for (const v of p.variants) { const x = p.compute({ ...p.defaults(r), [p.variantKey]: v.value }, r); if (!(x.typical > 0)) { fail++; console.error(p.key, v.slug, r.label); } }
}
const us = (k: string) => { const p = PROJECTS.find((x) => x.key === k)!; return Math.round(p.compute(p.defaults(NATIONAL_REGION), NATIONAL_REGION).typical); };
console.log("US typical:", { roofing: us("roofing"), solar: us("solar"), hvac: us("hvac"), windows: us("windows"), fence: us("fence") });
console.log(fail ? `${fail} FAILURES` : "All checks passed");
process.exit(fail ? 1 : 0);
