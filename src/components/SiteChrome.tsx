"use client";
import { usePathname } from "next/navigation";

/** Site header, footer, consent and ad scripts. Hidden inside the embeddable widget (/embed/*). */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path?.startsWith("/embed/")) return null;
  return <>{children}</>;
}
