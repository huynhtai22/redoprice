import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-extrabold">Page not found</h1>
      <p className="mt-2 text-ink-2">That page doesn&apos;t exist. Try a calculator instead.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-accent-500 px-5 py-3 font-semibold text-white">Go to calculators</Link>
    </div>
  );
}
