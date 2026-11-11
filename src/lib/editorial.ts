/**
 * Who stands behind the numbers. People live in src/lib/people.ts; this file keeps the older
 * AUTHOR / REVIEWER exports for components that only need a name.
 * No invented credentials: REVIEWER stays null until a real reviewer profile is published.
 */
import { bylineFor, personUrl } from "./people";

export type Person = { name: string; role: string; href?: string };

const { author, reviewer } = bylineFor();
export const AUTHOR: Person = { name: author.name, role: author.role, href: personUrl(author) };
export const REVIEWER: Person | null = reviewer ? { name: reviewer.name, role: reviewer.role, href: personUrl(reviewer) } : null;

export const INDEPENDENCE = "No contractor or manufacturer can pay to change our numbers.";
