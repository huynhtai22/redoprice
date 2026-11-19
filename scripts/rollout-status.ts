/** Print the indexing rollout: which city pages each wave adds. `npm run rollout:status` */
import { PROJECTS } from "../src/lib/projects";
import { METROS } from "../src/lib/data";
import { WAVES, WAVE, cityWave } from "../src/lib/indexing";

console.log(`Active wave (NEXT_PUBLIC_INDEX_WAVE): ${WAVE}\n`);
let cumulative = 0;
for (const w of WAVES) {
  const pages = PROJECTS.flatMap((p) => METROS.filter((m) => cityWave(p, m) === w.wave).map((m) => `${p.slug}/${m.slug}`));
  cumulative += pages.length;
  const mark = w.wave <= WAVE ? "LIVE " : "     ";
  console.log(`${mark} Wave ${w.wave}: ${w.name}\n       +${pages.length} city pages (${cumulative} total). Release: ${w.release}`);
}
const never = PROJECTS.flatMap((p) => METROS.filter((m) => cityWave(p, m) === Infinity)).length;
if (never) console.log(`\n${never} city pages are in no wave (noindex until a wave covers them).`);
