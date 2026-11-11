/**
 * /ads.txt — required by AdSense. Generated from NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-XXXX -> pub-XXXX).
 * Until the client id is set, serves a commented placeholder.
 */
export const dynamic = "force-static";
export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const body = client
    ? `google.com, ${client.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`
    : "# ads.txt placeholder: set NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX and redeploy\n";
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
