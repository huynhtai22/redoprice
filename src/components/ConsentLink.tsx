"use client";
export default function ConsentLink() {
  return <button onClick={() => window.dispatchEvent(new Event("rp-open-consent"))} className="hover:text-paper hover:underline">Cookie choices</button>;
}
