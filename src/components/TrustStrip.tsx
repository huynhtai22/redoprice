import Link from "next/link";

/** Short, plain promises under the calculator, the way Bankrate and Wirecutter state them. */
export default function TrustStrip() {
  const items = [
    ["Independent", "No contractor or manufacturer can pay to change a number."],
    ["Private", "Your estimate stays in your browser. We share details only if you ask for quotes."],
    ["How we make money", "Ads, and a fee if you choose to be introduced to a contractor."],
  ];
  return (
    <div className="grid gap-4 border-y border-line py-5 text-[15px] sm:grid-cols-[repeat(3,minmax(0,1fr))_auto] sm:items-start sm:gap-6">
      {items.map(([t, b]) => (
        <p key={t} className="text-ink-2"><span className="block font-semibold text-ink">{t}</span>{b}</p>
      ))}
      <Link href="/how-we-calculate" className="link inline-flex min-h-[44px] items-center font-semibold sm:justify-end">How we calculate</Link>
    </div>
  );
}
