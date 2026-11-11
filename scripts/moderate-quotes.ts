/**
 * Moderate shared quotes before anything is published.
 *
 *   npm run quotes:moderate -- <export.json|export.csv>          import new submissions as "pending"
 *   npm run quotes:moderate -- <export> --approve-clean          also approve rows with no auto-flags
 *   npm run quotes:moderate -- --list                             show the pending queue
 *   npm run quotes:moderate -- --approve id1,id2 | --reject id3   decide by hand
 *
 * Input: the raw rows your NEXT_PUBLIC_QUOTE_DATA_ENDPOINT collects (Formspree/Sheets export),
 * with the fields ShareQuoteForm sends. Full ZIPs and timestamps are reduced to ZIP3 and month
 * on import, so they never reach the repo. Then commit src/data/community-quotes.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { PROJECTS } from "../src/lib/projects";
import { regionFor, stateFromZip } from "../src/lib/data";
import type { CommunityQuote } from "../src/lib/communityQuotes";

const FILE = new URL("../src/data/community-quotes.json", import.meta.url);
const db = JSON.parse(readFileSync(FILE, "utf8")) as { meta: Record<string, string>; minSample: number; quotes: CommunityQuote[] };
const args = process.argv.slice(2);
const flag = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] ?? "" : undefined; };
const save = () => { db.meta.updated = new Date().toISOString().slice(0, 10); writeFileSync(FILE, JSON.stringify(db, null, 2) + "\n"); };

function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = []; let cur: string[] = []; let f = ""; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true; else if (c === ",") { cur.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; cur.push(f); rows.push(cur); cur = []; f = ""; }
    else f += c;
  }
  if (f || cur.length) { cur.push(f); rows.push(cur); }
  const [head, ...body] = rows.filter((r) => r.some((x) => x.trim()));
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

function importRows(path: string, approveClean: boolean) {
  const text = readFileSync(path, "utf8");
  const rows: Record<string, unknown>[] = path.endsWith(".csv") ? parseCSV(text) : JSON.parse(text);
  const seen = new Set(db.quotes.map((q) => q.id));
  let added = 0, skipped = 0;
  for (const r of rows) {
    const project = String(r.project ?? "");
    const zip = String(r.zip ?? "").trim();
    const amount = Number(String(r.quoteAmount ?? r.amount ?? "").replace(/[^0-9.]/g, ""));
    const p = PROJECTS.find((x) => x.key === project);
    const st = stateFromZip(zip);
    if (!p || !st || !(amount > 0) || String(r.website ?? "")) { skipped++; continue; }
    // Stable id from the raw row, so re-importing the same export is a no-op. Hash is one-way.
    const id = createHash("sha256").update(JSON.stringify([project, zip, amount, r.variant, r.size, r.submittedAt])).digest("hex").slice(0, 12);
    if (seen.has(id)) continue;

    const flags: string[] = [];
    const region = regionFor(st);
    const variant = r.variant ? String(r.variant) : undefined;
    const est = p.compute({ ...p.defaults(region), ...(variant ? { [p.variantKey]: variant } : {}) }, region);
    const ratio = amount / est.typical;
    if (ratio < 0.35 || ratio > 3) flags.push(`outlier: ${ratio.toFixed(2)}x the model's typical job`);
    if (db.quotes.some((q) => q.project === project && q.zip3 === zip.slice(0, 3) && q.amount === amount)) flags.push("possible duplicate");
    const month = /^\d{4}-\d{2}$/.test(String(r.quoteMonth ?? "")) ? String(r.quoteMonth) : String(r.submittedAt ?? new Date().toISOString()).slice(0, 7);
    if (month > new Date().toISOString().slice(0, 7)) flags.push("month in the future");
    const size = String(r.size ?? "").replace(/[^0-9a-zA-Z ,.]/g, "").slice(0, 24) || undefined; // no free text survives

    db.quotes.push({
      id, project, zip3: zip.slice(0, 3), state: st.code, variant, size, amount: Math.round(amount), month,
      outcome: r.outcome ? String(r.outcome).slice(0, 40) : undefined,
      status: approveClean && flags.length === 0 ? "approved" : "pending",
      ...(flags.length ? { flags } : {}),
    });
    seen.add(id); added++;
  }
  save();
  console.log(`Imported ${added} new, skipped ${skipped} invalid. Pending: ${db.quotes.filter((q) => q.status === "pending").length}.`);
}

function decide(ids: string, status: "approved" | "rejected") {
  for (const id of ids.split(",").map((s) => s.trim()).filter(Boolean)) {
    const q = db.quotes.find((x) => x.id === id);
    if (!q) console.warn(`No quote ${id}`); else q.status = status;
  }
  save();
}

if (flag("--approve") !== undefined) decide(flag("--approve")!, "approved");
else if (flag("--reject") !== undefined) decide(flag("--reject")!, "rejected");
else if (args.includes("--list") || !args[0]) {
  const pend = db.quotes.filter((q) => q.status === "pending");
  console.table(pend.map(({ id, project, state, zip3, variant, amount, month, flags }) => ({ id, project, state, zip3, variant, amount, month, flags: flags?.join("; ") ?? "" })));
  const counts: Record<string, number> = {};
  db.quotes.filter((q) => q.status === "approved").forEach((q) => { counts[`${q.project} ${q.state}`] = (counts[`${q.project} ${q.state}`] ?? 0) + 1; });
  console.log(`Approved by project/state (published at ${db.minSample}+):`, counts);
} else importRows(args[0], args.includes("--approve-clean"));
