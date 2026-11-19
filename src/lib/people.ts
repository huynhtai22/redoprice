/**
 * Authors and expert reviewers.
 *
 * Rules (Google's E-E-A-T guidance and plain honesty):
 * - Never invent a person, a license or a credential. Placeholder profiles stay `published: false`.
 * - An unpublished profile is never named in a byline or in schema; its page exists (noindex) so the
 *   layout can be reviewed, and it says the role is being filled.
 * - To add the real reviewer: fill name, bio, credentials (with a public verify link, e.g. a state
 *   license lookup), sameAs links and a photo, then set `published: true`.
 */
import { SITE } from "./site";

export type ProjectKey = "roofing" | "solar" | "hvac" | "windows" | "fence";

export type Credential = {
  label: string;          // "Licensed roofing contractor, Texas"
  issuer?: string;        // "Texas Department of Licensing and Regulation"
  id?: string;            // license number, shown so readers can check it
  verifyUrl?: string;     // public lookup page
};

export type Person = {
  slug: string;
  kind: "author" | "reviewer";
  published: boolean;
  name: string;
  role: string;
  /** One line under the name in bylines */
  short: string;
  bio: string[];
  credentials: Credential[];
  /** What this person reviews or writes about */
  covers: ProjectKey[] | "all";
  yearsInTrade?: number;
  location?: string;
  photo?: string;
  sameAs: string[];
  /** When they joined RedoPrice (ISO date) */
  since?: string;
};

export const PEOPLE: Person[] = [
  {
    slug: "cost-desk",
    kind: "author",
    published: true,
    name: "RedoPrice Cost Desk",
    role: "Data and editorial team",
    short: "Maintains the cost model, the public data imports and every calculator page.",
    bio: [
      "The Cost Desk is the small team that builds and maintains RedoPrice: the cost model, the yearly import of government wage data, the monthly electricity price refresh and the guides.",
      "We write in plain language, show the math behind every number and correct mistakes in the open. When a page changes in a way that moves the estimate, the data release number on that page changes too.",
    ],
    credentials: [],
    covers: "all",
    sameAs: [],
    since: "2026-11-01",
  },
  {
    slug: "founder",
    kind: "author",
    published: false,
    name: "Founder and editor",
    role: "Founder and editor",
    short: "Placeholder: founder profile, to be completed before it is shown in bylines.",
    bio: [
      "This profile is a placeholder. Add the founder's real name, photo, background and a contact or LinkedIn link, then set published to true.",
    ],
    credentials: [],
    covers: "all",
    sameAs: [],
  },
  {
    slug: "roofing-reviewer",
    kind: "reviewer",
    published: false,
    name: "Roofing reviewer",
    role: "Expert reviewer, roofing",
    short: "Open role: a licensed roofing contractor or estimator who checks our roofing numbers.",
    bio: [
      "We are recruiting a working roofing contractor or estimator to review the roofing calculator, its default assumptions and the roofing guides at least twice a year.",
      "Until this role is filled, roofing pages are not marked as expert reviewed.",
    ],
    credentials: [],
    covers: ["roofing", "solar"],
    sameAs: [],
  },
  {
    slug: "hvac-reviewer",
    kind: "reviewer",
    published: false,
    name: "HVAC reviewer",
    role: "Expert reviewer, heating and cooling",
    short: "Open role: a licensed HVAC contractor who checks our heating and cooling numbers.",
    bio: [
      "We are recruiting a licensed HVAC contractor (state mechanical license, EPA 608 certified) to review sizing rules, equipment tiers and installed costs.",
      "Until this role is filled, HVAC pages are not marked as expert reviewed.",
    ],
    credentials: [],
    covers: ["hvac"],
    sameAs: [],
  },
  {
    slug: "exterior-reviewer",
    kind: "reviewer",
    published: false,
    name: "Exterior trades reviewer",
    role: "Expert reviewer, windows and fencing",
    short: "Open role: a general or exterior contractor who checks our window and fence numbers.",
    bio: [
      "We are recruiting a licensed general or exterior contractor to review window replacement and fence installation costs, including removal, permits and site conditions.",
      "Until this role is filled, window and fence pages are not marked as expert reviewed.",
    ],
    credentials: [],
    covers: ["windows", "fence"],
    sameAs: [],
  },
];

export const getPerson = (slug: string) => PEOPLE.find((p) => p.slug === slug);
export const PUBLISHED = PEOPLE.filter((p) => p.published);
export const personUrl = (p: Person) => `/authors/${p.slug}`;

const covers = (p: Person, key?: string) => p.covers === "all" || (!!key && (p.covers as string[]).includes(key));

/** Byline for a page: the published author, plus a reviewer only when a real one is published. */
export function bylineFor(projectKey?: string) {
  const author = PUBLISHED.find((p) => p.kind === "author" && p.slug !== "cost-desk" && covers(p, projectKey)) ?? getPerson("cost-desk")!;
  const reviewer = PUBLISHED.find((p) => p.kind === "reviewer" && covers(p, projectKey));
  const openReviewer = PEOPLE.find((p) => p.kind === "reviewer" && !p.published && covers(p, projectKey));
  return { author, reviewer, openReviewer };
}

/** schema.org Person (or Organization for the team profile). Only for published profiles. */
export function personSchema(p: Person) {
  const url = `${SITE.url}${personUrl(p)}`;
  if (p.slug === "cost-desk") return { "@type": "Organization", name: p.name, url, parentOrganization: { "@type": "Organization", name: SITE.name, url: SITE.url } };
  return {
    "@type": "Person",
    name: p.name,
    url,
    jobTitle: p.role,
    description: p.short,
    ...(p.photo ? { image: `${SITE.url}${p.photo}` } : {}),
    ...(p.sameAs.length ? { sameAs: p.sameAs } : {}),
    worksFor: { "@type": "Organization", name: SITE.name, url: SITE.url },
    ...(p.credentials.length ? {
      hasCredential: p.credentials.map((c) => ({
        "@type": "EducationalOccupationalCredential", name: c.label, credentialCategory: "license",
        ...(c.issuer ? { recognizedBy: { "@type": "Organization", name: c.issuer } } : {}),
        ...(c.verifyUrl ? { url: c.verifyUrl } : {}),
      })),
    } : {}),
  };
}
