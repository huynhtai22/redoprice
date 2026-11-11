export const SITE = {
  name: "RedoPrice",
  domain: "redoprice.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://redoprice.com",
  tagline: "Know what it should cost before anyone quotes you",
  description:
    "Free home improvement cost calculators for roofs, solar, HVAC, windows and fences. Live estimates adjusted for your ZIP code, with the math shown.",
  contactEmail: "hello@redoprice.com",
};

export const NAV = [
  { href: "/#projects", label: "Calculators" },
  { href: "/check-my-quote", label: "Check my quote" },
  { href: "/repair-or-replace", label: "Repair or replace" },
  { href: "/guides", label: "Guides" },
];
