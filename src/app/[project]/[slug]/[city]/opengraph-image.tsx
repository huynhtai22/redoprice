import { notFound } from "next/navigation";
import { costCard } from "@/lib/og/costCard";
import { resolveCard } from "@/lib/og/resolve";

export const alt = "Cost sheet: typical price, fair range and cost breakdown";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ project: string; slug: string; city: string }> }) {
  const { project, slug, city } = await params;
  const c = resolveCard(project, slug, city);
  if (!c) notFound();
  return costCard(c, "og");
}
