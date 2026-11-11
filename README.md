# RedoPrice.com

"Know what it should cost before anyone quotes you." Free home improvement cost calculators (roof, solar, HVAC, windows, fence) with ZIP-adjusted live estimates. AdSense-first.

Live preview: https://redoprice.vercel.app (custom domain redoprice.com to be added).

Stack: Next.js 15 (App Router) + TypeScript + Tailwind v4. Fully static (about 570 pages), deploys on Vercel.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
```

## Where things live

| What | Where |
| --- | --- |
| Cost data (versioned, with source + status + updated date) | `src/data/2026-11/*.json` |
| Data loader, ZIP → state, regions | `src/lib/data.ts` |
| Calculators (inputs, defaults, formulas, materials, FAQs) | `src/lib/projects/*.ts` |
| Comparisons, resale %, DIY settings | `src/lib/projects/index.ts` |
| **All ad settings** | `src/lib/ads.ts` (see `docs/ADSENSE.md`) |
| Indexing waves for programmatic pages | `src/lib/indexing.ts` |
| Form endpoints (quote request, anonymous shared quotes) | `src/lib/submit.ts` + env vars |
| Guides | `src/lib/guides.ts` |
| Brand / domain | `src/lib/site.ts` |

## Data status — read this

All datasets in `src/data/2026-11/` are marked `"status": "estimate"`. They are hand-set modeled values, **not** imported from BLS/EIA/NREL yet (those hosts were not reachable from the build environment). Every page shows a "Modeled estimates" label while any dataset is an estimate. To replace them:

1. Download the OEWS state or metro file from bls.gov/oes (Excel → save as CSV).
2. `npm run import:oews -- path/to/oews.csv` prints new labor indexes from construction trade wages.
3. Paste into `regional-index.json` / `metro-index.json`, set `status` to `verified`, update `updated`.
4. Same for EIA electricity prices and NREL PVWatts yields in `energy-solar.json`.

Never copy competitors' price tables. Calibrate with first-party data from `/share-your-quote`.

## Pages

- `/` home with intent entry points: Plan a project · Check my quote · Emergency repair
- `/{project}` hub calculator · `/{project}/{material}` · `/{project}/{state}` · `/{project}/{state}/{city}` · `/{project}/compare/{a}-vs-{b}`
- `/check-my-quote`, `/repair-or-replace`, `/share-your-quote`, `/guides/*`, `/how-we-calculate`
- `/about`, `/contact`, `/privacy`, `/terms`, `/disclaimer`, `/ads.txt`, `/sitemap.xml`, `/robots.txt`

## Analytics events (dataLayer)

`calc_start`, `calc_zip`, `calc_switch_project`, `quote_check_open`, `quote_check`, `compare_click`, `diy_toggle`, `share_link`, `related_click`, `lead_open`, `lead_submit`, `share_quote_submit`, `ror_tab`.

## Design language (v2)

A contractor's written estimate on kraft paper, with blueprint line drawings. Source Serif 4 headlines, IBM Plex Sans body, IBM Plex Mono for labels and figures. Palette: graphite ink, kraft paper, blueprint blue, pencil red for prices and marks. No gradients, no icon sets, square corners, ruled lists instead of card grids. Illustrations are hand-coded SVG line drawings (`src/components/Sketch.tsx`).
