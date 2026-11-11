import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import Byline from "@/components/Byline";
import { DATASETS, DATA_UPDATED, NATIONAL, STATUS_LABEL, getState, regionFor, type DatasetMeta } from "@/lib/data";
import { projectByKey } from "@/lib/projects";
import { formatNum, formatUSD, formatUSD2, longDate, roundMoney } from "@/lib/format";
import { pageSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "How We Calculate Costs: Method, Data Sources & Editorial Standards",
  description: "The cost model behind every RedoPrice estimate, worked through step by step: national base rates, BLS wage data, BEA price levels, EIA electricity prices, review and corrections.",
  alternates: { canonical: "/how-we-calculate" },
};

const STATUS_HELP: Record<DatasetMeta["status"], string> = {
  sourced: "Imported directly from the public source listed. We do not adjust the numbers.",
  partial: "Some fields come straight from public data; the rest are still our modeled estimates, labelled as such.",
  model: "Our own cost model. Built and maintained by us, then checked against the public references listed.",
  estimate: "A modeled placeholder waiting for its public import. Treat with extra caution.",
  verified: "Public or modeled data that a named, licensed trade reviewer has signed off on.",
};

/** Formula term with a numbered callout, like a dimension on a drawing. */
function Term({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <span className="relative inline-block border-b-2 border-blue pb-0.5">
      {children}
      <sup className="ml-0.5 font-mono text-[11px] font-semibold text-accent-600">{n}</sup>
    </span>
  );
}

export default function Page() {
  // Worked example: a typical architectural-shingle roof in Texas, computed live from the current data release.
  const tx = regionFor(getState("TX")!);
  const roof = projectByKey("roofing");
  const inputs = roof.defaults(tx);
  const est = roof.compute(inputs, tx);
  const R = NATIONAL.roofing;
  const m = R.materials["architectural-asphalt"];
  const area = (Number(inputs.homeSqft) / Number(inputs.stories)) * R.pitch.medium.areaFactor * R.overhangFactor;
  const matRate = m.typical * (1 - m.laborShare) * tx.materialIndex;
  const labRate = m.typical * m.laborShare * tx.laborIndex;
  const regionalRate = matRate + labRate;
  const steps: [string, string, string][] = [
    ["National installed rate", `${formatUSD2(m.typical)} / sq ft`, "Typical architectural-shingle roof, US average, materials and labor together"],
    ["Material part", `${formatUSD2(m.typical)} × ${Math.round((1 - m.laborShare) * 100)}% × ${tx.materialIndex.toFixed(3)} = ${formatUSD2(matRate)}`, `Texas price level for goods (BEA) is ${tx.materialIndex.toFixed(3)} of the US`],
    ["Labor part", `${formatUSD2(m.typical)} × ${Math.round(m.laborShare * 100)}% × ${tx.laborIndex.toFixed(3)} = ${formatUSD2(labRate)}`, "Texas construction trade wages relative to the US"],
    ["Texas installed rate", `${formatUSD2(regionalRate)} / sq ft`, "Material part plus labor part"],
    ["Roof area", `${formatNum(Math.round(area / 10) * 10)} sq ft`, `${formatNum(Number(inputs.homeSqft))} sq ft home, 1 story, medium pitch, +8% overhang`],
    ["Plus tear-off and permit", "1 old layer, local permit", "Both scaled by the labor index"],
  ];
  const datasets = [...DATASETS].sort((a, b) => ["sourced", "verified", "partial", "model", "estimate"].indexOf(a.status) - ["sourced", "verified", "partial", "model", "estimate"].indexOf(b.status));

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 pt-5">
        <Breadcrumbs items={[{ href: "/how-we-calculate", label: "How we calculate" }]} />
        <p className="mt-6 label">Method</p>
        <h1 className="mt-1 font-display text-[2.3rem] font-bold leading-[1.08] tracking-[-0.015em] sm:text-[3.2rem]">How we calculate<br /><span className="text-accent-600">what it should cost</span></h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">
          No copied price tables, no lead-gen guesswork. Every estimate runs through the same short formula, fed by government data where it exists and by our own model where it does not. Below is the formula, a real example worked by hand, and the status of every dataset.
        </p>
        <div className="mt-5 border-y border-line py-3"><Byline updated={DATA_UPDATED} sourcesHref="#sources" /></div>
      </div>

      {/* The formula, with numbered terms explained underneath */}
      <section className="mx-auto mt-10 max-w-5xl px-4">
        <div className="relative rounded-md border border-line bg-paper px-5 pb-6 pt-8 sm:px-10">
          <span className="absolute -top-3 left-4 bg-canvas px-2 label">The formula</span>
          <p className="text-center font-display text-[1.25rem] leading-[2.2] sm:text-[1.75rem]">
            Estimate = ( <Term n={1}>rate</Term> × <Term n={2}>material %</Term> × <Term n={3}>material index</Term> + <Term n={1}>rate</Term> × <Term n={4}>labor %</Term> × <Term n={5}>labor index</Term> × <Term n={6}>difficulty</Term> ) × <Term n={7}>size</Term> + removal + permit
          </p>
          <ol className="mt-6 grid gap-x-8 gap-y-2 border-t border-line-2 pt-4 text-[14.5px] text-ink-2 sm:grid-cols-2">
            <li><b className="font-mono text-accent-600">1</b> National installed rate per unit, with low, typical and high values. <span className="text-mute">Our cost model.</span></li>
            <li><b className="font-mono text-accent-600">2·4</b> How that rate splits between materials and labor, per material.</li>
            <li><b className="font-mono text-accent-600">3</b> Price level for goods in your state. <span className="text-mute">BEA Regional Price Parities.</span></li>
            <li><b className="font-mono text-accent-600">5</b> Construction trade wages where you live vs the US. <span className="text-mute">BLS wage survey.</span></li>
            <li><b className="font-mono text-accent-600">6</b> Job difficulty: pitch, stories, slope, full-frame installs.</li>
            <li><b className="font-mono text-accent-600">7</b> Your size input: roof area, feet of fence, windows, tons, watts.</li>
          </ol>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4">
        <div className="prose-x mt-12">
          <h2>Worked example: a typical roof in Texas</h2>
          <p>This is computed live from the current data release, the same way the calculator does it. If the data changes, this example changes with it.</p>
        </div>
        <ol className="mt-2 border-t-2 border-ink">
          {steps.map(([k, v, why], i) => (
            <li key={k} className="grid gap-x-4 border-b border-line py-3 sm:grid-cols-[2rem_12rem_minmax(0,1fr)]">
              <span className="font-mono text-sm text-accent-600">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-semibold">{k}</span>
              <span>
                <span className="font-mono text-[14.5px] tnum">{v}</span>
                <span className="block text-[14px] text-mute">{why}</span>
              </span>
            </li>
          ))}
          <li className="grid gap-x-4 rounded-b-md bg-ink px-3 py-4 text-white sm:grid-cols-[2rem_12rem_minmax(0,1fr)] sm:px-0">
            <span className="font-mono text-sm text-white/60 sm:pl-0">=</span>
            <span className="font-semibold">Estimate, Texas</span>
            <span className="font-mono text-lg tnum">{formatUSD(roundMoney(est.typical))} <span className="text-[14px] text-white/60">typical · range {formatUSD(roundMoney(est.low))} to {formatUSD(roundMoney(est.high))}</span></span>
          </li>
        </ol>
        <p className="mt-3 text-[15px] text-ink-2">Try it with your own roof in the <Link href="/roof-replacement-cost/texas" className="link">Texas roof calculator</Link>.</p>

        <div className="prose-x mt-12">
          <h2 id="sources">Data sources and their status</h2>
          <p>Each dataset is a versioned file with a release number, a date and a status. The status tells you how much of it comes straight from public data. Every cost page shows the datasets it uses at the bottom.</p>
        </div>
        <div className="mt-2 overflow-x-auto border-t-2 border-ink">
          <table className="w-full min-w-[620px] text-[14.5px]">
            <thead className="text-left font-mono text-[10.5px] uppercase tracking-wider text-mute">
              <tr><th className="py-2 pr-3">Dataset</th><th className="py-2 pr-3">Status</th><th className="py-2 pr-3">Sources</th><th className="py-2">Release</th></tr>
            </thead>
            <tbody className="divide-y divide-line align-top">
              {datasets.map((d) => (
                <tr key={d.dataset}>
                  <td className="py-3 pr-3 font-mono text-[13px]">{d.dataset}</td>
                  <td className="py-3 pr-3"><span className="whitespace-nowrap border border-line-2 px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-wider">{STATUS_LABEL[d.status]}</span></td>
                  <td className="py-3 pr-3 text-ink-2">
                    <ul className="space-y-1">
                      {d.refs?.map((r) => <li key={r.url + r.label}><a href={r.url} target="_blank" rel="noopener" className="link">{r.publisher}</a>: {r.label}</li>)}
                      {d.sources.filter((s) => !d.refs?.length || /pending|RedoPrice|modeled|by hand/i.test(s)).map((s) => <li key={s} className={d.refs?.length ? "italic text-mute" : ""}>{s}</li>)}
                    </ul>
                  </td>
                  <td className="whitespace-nowrap py-3 font-mono text-[12px] text-mute tnum">{d.version}<br />{longDate(d.updated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className="mt-6 grid gap-x-8 gap-y-3 text-[14.5px] sm:grid-cols-2">
          {(Object.keys(STATUS_HELP) as DatasetMeta["status"][]).map((s) => (
            <div key={s}><dt className="font-mono text-[11px] uppercase tracking-wider text-ink">{STATUS_LABEL[s]}</dt><dd className="text-ink-2">{STATUS_HELP[s]}</dd></div>
          ))}
        </dl>

        <div className="prose-x mt-12">
          <h2>Why these sources</h2>
          <ul>
            <li><strong>Labor: BLS Occupational Employment and Wage Statistics.</strong> The largest US wage survey, published every spring for every state and metro area. We weight roofers, carpenters, electricians, plumbers, HVAC mechanics, glaziers, fence erectors, solar installers, sheet metal workers and laborers by how many of them work nationally, so the index compares pay, not the local job mix. Wages are not contractor bill rates; contractors add payroll taxes, insurance, overhead and profit. That markup is already inside the national rate, so we only use wages to compare places.</li>
            <li><strong>Materials: BEA Regional Price Parities, goods.</strong> The government&apos;s measure of how much more or less goods cost in each state. It is broad (all goods, not lumber or shingles alone), so remote markets such as Alaska and Hawaii can still run higher for building materials than it shows.</li>
            <li><strong>Energy: EIA residential electricity prices and NREL PVWatts.</strong> They drive solar savings and HVAC running costs.</li>
            <li><strong>National rates: our cost model.</strong> There is no free public table of installed prices. We build rates per unit and check them against public references (for example, Berkeley Lab&apos;s solar price data and the BLS construction materials price index) and against shelf prices at major retailers. As homeowners <Link href="/share-your-quote">share real quotes</Link>, we will calibrate against those too.</li>
          </ul>
          <p>We never copy a competitor&apos;s price table.</p>

          <h2>Low, typical and high</h2>
          <p>Low and high are the realistic spread between budget and premium contractors and products for the same job. A quote outside the range is not necessarily wrong, but it deserves questions. &quot;Local average&quot; is the typical price for a standard job in your area, so you can see how your choices move the number.</p>

          <h2>Refresh schedule</h2>
          <ul>
            <li>Labor wages: yearly, after each BLS wage release (spring).</li>
            <li>Material price levels and spot checks: quarterly.</li>
            <li>Electricity prices: monthly checks, updated when the state average moves more than 5%.</li>
            <li>Any change that moves estimates gets a new release number, shown under each page&apos;s headline.</li>
          </ul>

          <h2 id="editorial">Editorial standards</h2>
          <ul>
            <li><strong>Who writes.</strong> Pages are written and maintained by the <Link href="/authors/cost-desk">RedoPrice Cost Desk</Link>.</li>
            <li><strong>Who checks.</strong> Each trade gets a licensed professional reviewer. We only name a reviewer once a real person has signed on, and list their license so you can verify it. Until then, pages say &quot;Trade review pending&quot;. See <Link href="/authors">our people</Link>.</li>
            <li><strong>Independence.</strong> Ads and quote requests pay for the site. They never change an estimate: everyone gets the same model.</li>
            <li><strong>Corrections.</strong> Found a number that is off for your area? <Link href="/contact">Tell us</Link>. We check every report and fix confirmed errors within a week, with a new data release.</li>
          </ul>

          <h2>Limits</h2>
          <p>An estimate cannot see your home. Hidden damage, access, local code, HOA rules and how busy contractors are all change real prices. Use these numbers to plan and to check quotes. They are not a quote.</p>
        </div>
      </div>
      <JsonLd data={pageSchema({ type: "Article", title: "How we calculate what it should cost", description: "RedoPrice's cost model, data sources and editorial standards.", path: "/how-we-calculate" })} />
    </>
  );
}
