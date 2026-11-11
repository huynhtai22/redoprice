const P: Record<string, React.ReactNode> = {
  roof: <><path d="M3 12 12 4l9 8" /><path d="M5 10.5V20h14v-9.5" /><path d="M10 20v-5h4v5" /></>,
  solar: <><rect x="3" y="9" width="18" height="10" rx="1" /><path d="M3 14h18M9 9v10M15 9v10" /><path d="M12 2v3M5.6 4.6l1.5 1.5M18.4 4.6l-1.5 1.5" /></>,
  hvac: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="12" cy="12" r="4" /><path d="M12 8v8M8 12h8" /></>,
  window: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M12 3v18M4 12h16" /></>,
  fence: <><path d="M5 21V7l2-3 2 3v14M15 21V7l2-3 2 3v14" /><path d="M3 10h18M3 16h18" /></>,
  quote: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 12h7M9 16h5M9 8h4" /></>,
  plan: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4M7 13h4M7 17h7" /></>,
  alert: <><path d="M12 3 2 20h20z" /><path d="M12 10v4M12 17v.5" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="m5 12 4 4 10-10" />,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  tag: <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
  home: <><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></>,
  tools: <><path d="M14 6a4 4 0 0 0 5 5l-9 9-3-3 9-9" /><path d="m3 21 3-3" /></>,
};
export default function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {P[name] ?? P.home}
    </svg>
  );
}
