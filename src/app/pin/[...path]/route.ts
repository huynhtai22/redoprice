import { costCard } from "@/lib/og/costCard";
import { resolveCard } from "@/lib/og/resolve";

/**
 * Tall Pinterest pin (1000x1500) for any cost page: /pin/<project>[/<variant-or-state>[/<city>]].
 * Rendered on first request, then cached at the edge.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const [project, slug, city] = (await params).path;
  const c = resolveCard(project, slug, city?.replace(/\.png$/, ""));
  if (!c) return new Response("Not found", { status: 404 });
  return costCard(c, "pin");
}
