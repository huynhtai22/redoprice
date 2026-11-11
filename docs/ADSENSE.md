# AdSense playbook for RedoPrice

## 1. Getting approved
- Site must be on its own domain (redoprice.com), not *.vercel.app. Add the domain first.
- Required pages are live: About, Contact, Privacy (with Google cookie disclosure), Terms, Disclaimer.
- Navigation, sitemap and original content (calculators, guides, method page) are in place.
- Add the site in AdSense, set `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-…` in Vercel and redeploy. This adds the AdSense script, the `google-adsense-account` meta tag and a real `/ads.txt`.
- Approval usually takes days to a few weeks. Keep publishing guides meanwhile.

## 2. Placement rules (built into the layout)
| Slot | Where | Reserved height | Notes |
| --- | --- | --- | --- |
| afterResult | Below the whole calculator + result | 280 mobile / 250 desktop | Highest viewability; user already has their number |
| midContent | Between article sections | 280 / 250 | One per section group |
| sidebar | Sticky right rail, desktop only | 600 | Never beside the calculator |
| beforeFooter | After related links | 280 / 250 | |
| mobileAnchor | Fixed bottom, mobile | 60 | OFF by default (flag) |

Guardrails: no ads above the result on mobile, none beside inputs or buttons; slots are at least a screen apart so at most one in-flow ad is in view on mobile; below-the-fold slots lazy-load (IntersectionObserver, 300px margin); every slot reserves height so CLS stays ~0; the AdSense script loads `lazyOnload` to protect LCP.

Areas that must stay ad-free carry `data-ad-exclusion-zone` (`#calculator`, `#quote-form`, `#share-quote`). Auto ads is OFF by default. If you enable it, also exclude those areas in AdSense (Ads → By site → Edit → remove placements / page exclusions) and re-check the calculator on a phone.

## 3. Consent
Consent Mode v2 defaults are set in `<head>`: denied in EEA/UK/CH, granted elsewhere. The built-in banner updates consent. For EEA/UK traffic, Google requires a certified CMP: enable Google's in AdSense → Privacy & messaging, then set `NEXT_PUBLIC_CMP=google` so the two banners never stack.

## 4. Running experiments
Use AdSense → Optimization → Experiments (or toggle slot flags in `src/lib/ads.ts` for an A/B by time period).

Judge every test on **two** numbers, never one:
1. **Earnings per visit** (page RPM x pages per session), not page RPM alone. A layout that raises RPM but cuts pages per session can lose money.
2. **UX guardrails** from GA4: pages per session, calculator start rate (`calc_start` / pageviews), engagement time, and Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms in Search Console).

Rules of thumb: run each test at least 2 weeks and 1,000+ sessions per arm; change one thing at a time; roll back any variant that drops pages per session or calculator starts by more than 5% even if RPM rises.

Good first tests: mobile anchor on vs off; midContent above vs below the FAQ; sidebar ad sticky vs static; responsive vs fixed 300x250 in afterResult.
