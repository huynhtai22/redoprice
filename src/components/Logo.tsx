export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#f2601d" />
        <path d="M7 16.5 16 9l9 7.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.5 15v8h11v-8" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M14 20.5h4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className={`font-display text-[1.2rem] font-extrabold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        Redo<span className="text-accent-500">Price</span>
      </span>
    </span>
  );
}
