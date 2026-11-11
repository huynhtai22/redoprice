import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import { DATASETS, DATA_IS_ESTIMATE } from "@/lib/data";

export const metadata: Metadata = { title: "How We Calculate Costs: Method & Data Sources", description: "The cost model behind every RedoPrice estimate: national base costs, regional labor and material indexes, and the public data sources we use.", alternates: { canonical: "/how-we-calculate" } };

export default function Page() {
  return (
    <StaticPage title="How we calculate" path="/how-we-calculate">
      <p>Every estimate on RedoPrice comes from the same transparent model. We do not copy price tables from other websites; we build the numbers from a cost model and public data, and we show you the inputs.</p>
      <h2>The formula</h2>
      <p><strong>Estimate = (material share of the national rate x regional material index + labor share x regional labor index x job difficulty) x size + removal + permit.</strong></p>
      <ul>
        <li><strong>National base rates</strong>: installed cost per unit (per square foot of roof, per foot of fence, per window, per ton, per watt) with a low, typical and high value, split into a material share and a labor share.</li>
        <li><strong>Regional labor index</strong>: construction trade wages in your state or metro compared with the US average, from the Bureau of Labor Statistics Occupational Employment and Wage Statistics (OEWS).</li>
        <li><strong>Regional material index</strong>: delivered material prices, which run higher in remote states such as Alaska and Hawaii.</li>
        <li><strong>Job difficulty</strong>: roof pitch and stories, sloped ground, full-frame window installs and similar factors that change labor time.</li>
        <li><strong>Energy data</strong> (solar and HVAC): average residential electricity prices by state from the U.S. Energy Information Administration (EIA), and typical solar production per kW by state based on NREL PVWatts.</li>
      </ul>
      <h2>Low, typical and high</h2>
      <p>The low and high values reflect the realistic spread between budget and premium contractors and products for the same job. Quotes outside that range are not necessarily wrong, but they deserve a closer look.</p>
      <h2>Local average</h2>
      <p>&quot;Local average&quot; is the typical price for a standard job in your area (for example, a typical-size home with architectural shingles), so you can see how your choices move the price.</p>
      <h2>Data releases</h2>
      {DATA_IS_ESTIMATE && <p><strong>Current status:</strong> the first data release uses modeled estimates for the regional indexes while we import the full public datasets. Each dataset below lists its status, and every page shows the release and date.</p>}
      <table>
        <thead><tr><th>Dataset</th><th>Release</th><th>Updated</th><th>Status</th></tr></thead>
        <tbody>{DATASETS.map((d) => <tr key={d.dataset}><td>{d.dataset}</td><td>{d.version}</td><td>{d.updated}</td><td>{d.status === "estimate" ? "Modeled estimate" : "Imported"}</td></tr>)}</tbody>
      </table>
      <h3>Sources</h3>
      <ul>{[...new Set(DATASETS.flatMap((d) => d.sources))].map((s) => <li key={s}>{s}</li>)}</ul>
      <h2>Refresh schedule</h2>
      <ul><li>Labor wages: yearly, after each OEWS release (spring).</li><li>Material prices: quarterly.</li><li>Electricity prices and solar rules: monthly checks.</li></ul>
      <h2>Real quotes from homeowners</h2>
      <p>Visitors can <Link href="/share-your-quote">share a real quote anonymously</Link>. Once we have enough submissions for an area, we use them to calibrate the model and will publish aggregated figures.</p>
      <h2>Limits</h2>
      <p>An estimate cannot see your home. Hidden damage, access, local code requirements and contractor demand all change real prices. Use these numbers to plan and to check quotes, not as a quote.</p>
    </StaticPage>
  );
}
