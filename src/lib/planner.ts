"use client";
/**
 * Project planner: saved estimates live in this browser only (localStorage), no accounts.
 * We store the inputs, not the prices, and recompute on load, so a plan picks up each new
 * data release automatically.
 */
import { useEffect, useState } from "react";
import type { Inputs } from "./engine";

export type When = "now" | "year" | "later";
export type PlanItem = {
  id: string;
  slug: string;
  inputs: Inputs;
  stateCode?: string;
  metroSlug?: string;
  zip?: string;
  when: When;
  note?: string;
  addedAt: string;
};
export type Plan = { items: PlanItem[]; contingency: number };

const KEY = "redoprice.plan.v1";
const EVT = "redoprice-plan";
const EMPTY: Plan = { items: [], contingency: 0.15 };

export function loadPlan(): Plan {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as Plan;
    return { items: Array.isArray(p.items) ? p.items : [], contingency: typeof p.contingency === "number" ? p.contingency : 0.15 };
  } catch { return EMPTY; }
}

export function savePlan(p: Plan) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode: plan lives for this page view only */ }
  window.dispatchEvent(new Event(EVT));
}

export function addToPlan(item: Omit<PlanItem, "id" | "addedAt" | "when"> & { when?: When }): PlanItem {
  const p = loadPlan();
  const full: PlanItem = { when: "year", ...item, id: Math.random().toString(36).slice(2, 10), addedAt: new Date().toISOString() };
  savePlan({ ...p, items: [...p.items, full] });
  return full;
}

/** Live plan state that stays in sync across components and tabs. */
export function usePlan(): [Plan, (p: Plan) => void, boolean] {
  const [plan, setPlan] = useState<Plan>(EMPTY);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setPlan(loadPlan());
    sync(); setReady(true);
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener("storage", sync); };
  }, []);
  return [plan, (p) => { setPlan(p); savePlan(p); }, ready];
}

/** Share a plan with a partner without accounts: the whole plan rides in the URL hash. */
export function encodePlan(p: Plan) {
  const slim = { c: p.contingency, i: p.items.map((x) => [x.slug, x.inputs, x.stateCode ?? "", x.metroSlug ?? "", x.when, x.note ?? ""]) };
  return btoa(unescape(encodeURIComponent(JSON.stringify(slim))));
}
export function decodePlan(s: string): Plan | null {
  try {
    const o = JSON.parse(decodeURIComponent(escape(atob(s)))) as { c: number; i: [string, Inputs, string, string, When, string][] };
    return {
      contingency: o.c,
      items: o.i.map(([slug, inputs, st, metro, when, note], k) => ({ id: `s${k}`, slug, inputs, stateCode: st || undefined, metroSlug: metro || undefined, when, note: note || undefined, addedAt: new Date().toISOString() })),
    };
  } catch { return null; }
}
