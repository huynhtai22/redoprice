# City page rollout

All city pages are built and linked from day one, so visitors can use them. Only pages in the
active wave are indexable (no `noindex`) and listed in `sitemap.xml`. Config: `src/lib/indexing.ts`.

| Wave | Adds | When |
|---|---|---|
| 1 | Hubs, materials, comparisons, guides, tools, state pages. **No city pages.** | Now, through AdSense review |
| 2 | Top 10 metros for roofing and HVAC (20 pages) | After AdSense approval |
| 3 | Top 10 metros for every project | 2+ weeks after wave 2 |
| 4 | Top 25 metros for every project | 2+ weeks after wave 3 |
| 5 | All metros | 2+ weeks after wave 4 |

Run `npm run rollout:status` for exact page counts. New projects are picked up by waves 3–5 automatically.

## Releasing a wave

1. Check the go/no-go list below.
2. In Vercel → Project → Settings → Environment Variables, set `NEXT_PUBLIC_INDEX_WAVE` to the next number (Production).
3. Redeploy once (this costs one deploy of the daily Hobby limit).
4. In Search Console, resubmit `sitemap.xml`. Note the date here.

## Go / no-go before the next wave

- At least 14 days since the last wave.
- Search Console → Pages: most pages from the previous wave are **Indexed**, not "Crawled – currently not indexed". If many sit in "Crawled – not indexed", stop and add unique content to those pages before adding more.
- No manual action or AdSense policy warning.
- Organic clicks to the previous wave's pages are non-zero and growing.

## Earned indexing

From wave 2 on, a city page also becomes indexable early when its state has at least 5 moderated
real quotes for that project (`src/data/community-quotes.json`). Real local quotes are content no
competitor has, which is what makes a city page worth indexing.

## Shared quotes: moderation

1. Export submissions from the form endpoint (`NEXT_PUBLIC_QUOTE_DATA_ENDPOINT`) as CSV or JSON.
2. `npm run quotes:moderate -- export.csv` imports new rows as `pending`. Full ZIPs and timestamps are reduced to ZIP3 and month on import. Outliers (under 0.35x or over 3x the model) and duplicates are auto-flagged.
3. `npm run quotes:moderate -- --list` shows the queue. Approve with `--approve id1,id2`, reject with `--reject id3`. `--approve-clean` on import approves rows without flags.
4. Commit `src/data/community-quotes.json` and deploy. Nothing shows for an area until it has 5 approved quotes.
