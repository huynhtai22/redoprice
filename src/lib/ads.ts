/**
 * ALL ad settings in one place. Flip a flag here (or via env) and redeploy.
 *
 * Guardrails baked into the layout (see docs/ADSENSE.md):
 *  - Every slot reserves a fixed height, so ads never shift the layout (CLS).
 *  - No slot sits next to calculator inputs or buttons, and none above the result on mobile.
 *  - Slots below the fold are lazy-loaded when they come within ~300px of the viewport.
 *  - On mobile only one in-flow slot type is used per screen (spacing >= 1 viewport between slots).
 */

export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? ""; // "ca-pub-XXXXXXXXXXXXXXXX"

export type Placement = "afterResult" | "midContent" | "sidebar" | "beforeFooter" | "mobileAnchor";

type SlotConfig = {
  enabled: boolean;
  slotId: string;
  /** Reserved height in px on mobile / desktop (prevents layout shift). */
  minHeight: { mobile: number; desktop: number };
  lazy: boolean;
  /** Where this slot may render. */
  devices: "all" | "desktop" | "mobile";
  description: string;
};

const env = (k: string) => process.env[k] ?? "";
const flag = (k: string, dflt: boolean) => (process.env[k] === undefined ? dflt : process.env[k] === "true");

export const AD_SLOTS: Record<Placement, SlotConfig> = {
  afterResult: {
    enabled: flag("NEXT_PUBLIC_AD_AFTER_RESULT", true),
    slotId: env("NEXT_PUBLIC_ADSENSE_SLOT_AFTER_RESULT"),
    minHeight: { mobile: 280, desktop: 250 },
    lazy: true,
    devices: "all",
    description: "Below the full calculator + result card. Highest viewability; user has already seen their number.",
  },
  midContent: {
    enabled: flag("NEXT_PUBLIC_AD_MID_CONTENT", true),
    slotId: env("NEXT_PUBLIC_ADSENSE_SLOT_MID_CONTENT"),
    minHeight: { mobile: 280, desktop: 250 },
    lazy: true,
    devices: "all",
    description: "Between article sections (cost factors / FAQ). Max one per page section group.",
  },
  sidebar: {
    enabled: flag("NEXT_PUBLIC_AD_SIDEBAR", true),
    slotId: env("NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR"),
    minHeight: { mobile: 0, desktop: 600 },
    lazy: true,
    devices: "desktop",
    description: "Sticky 300x600 in the right rail of content sections on desktop (>=1024px). Never beside the calculator.",
  },
  beforeFooter: {
    enabled: flag("NEXT_PUBLIC_AD_BEFORE_FOOTER", true),
    slotId: env("NEXT_PUBLIC_ADSENSE_SLOT_BEFORE_FOOTER"),
    minHeight: { mobile: 280, desktop: 250 },
    lazy: true,
    devices: "all",
    description: "After related links, before the footer.",
  },
  mobileAnchor: {
    enabled: flag("NEXT_PUBLIC_AD_MOBILE_ANCHOR", false),
    slotId: env("NEXT_PUBLIC_ADSENSE_SLOT_MOBILE_ANCHOR"),
    minHeight: { mobile: 60, desktop: 0 },
    lazy: false,
    devices: "mobile",
    description: "OFF by default. Fixed 320x50 bottom anchor on mobile, closable. Hides the sticky estimate bar while shown.",
  },
};

/**
 * Auto ads: OFF by default because it can place ads between inputs and the result.
 * If you turn it on, add the calculator as an excluded area in AdSense
 * (Ads > By site > Edit > Page exclusions / remove individual ad placements),
 * and keep the elements marked data-ad-exclusion-zone free of ads.
 */
export const AUTO_ADS = flag("NEXT_PUBLIC_ADSENSE_AUTO_ADS", false);

/** Selectors of areas that must stay ad-free (documented for Auto ads exclusion setup). */
export const AD_EXCLUSION_ZONES = ["[data-ad-exclusion-zone]", "#calculator", "#quote-form", "#share-quote"];

export const adsLive = () => Boolean(ADSENSE_CLIENT);
