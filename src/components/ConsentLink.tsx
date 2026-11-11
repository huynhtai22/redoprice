"use client";
export default function ConsentLink() {
  return <button onClick={() => window.dispatchEvent(new Event("rp-open-consent"))} className="text-white/65 hover:text-white">Cookie choices</button>;
}
