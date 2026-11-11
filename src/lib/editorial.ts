/**
 * Who stands behind the numbers, shown in the byline on cost pages and guides.
 * Only list real people who agreed to be named. Until a reviewer has signed on, REVIEWER stays null
 * and the byline only says what we actually do (a cost model built on public data). No invented credentials.
 */
export type Person = { name: string; role: string; href?: string };

export const AUTHOR: Person = { name: "RedoPrice Cost Desk", role: "Cost research", href: "/about" };

export const REVIEWER: Person | null = null;

export const INDEPENDENCE = "No contractor or manufacturer can pay to change our numbers.";
