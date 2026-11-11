/**
 * Line drawings in a draftsman's style (no icon fonts, no stock art).
 * Stroke = currentColor so they take the blueprint blue or ink from the parent.
 */
const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const SK: Record<string, React.ReactNode> = {
  roof: (
    <g {...common}>
      <path d="M6 30 32 10l26 20" /><path d="M11 26v18h42V26" />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${14 + i * 3} ${27 - i * 2.3}h${36 - i * 6}`} strokeWidth="0.8" />)}
      <path d="M27 44V34h10v10" /><path d="M4 48h56" strokeDasharray="2 2" strokeWidth="0.8" />
    </g>
  ),
  solar: (
    <g {...common}>
      <path d="M6 34 32 14l26 20" /><path d="M11 30v14h42V30" />
      <path d="M35 17.5 49 28.3 44 32 30 21.2z" /><path d="M39.6 21 34.6 24.6M44.2 24.6l-5 3.6M37 19.2l7 5.4M33 22.6l7 5.4" strokeWidth="0.8" />
      <circle cx="12" cy="10" r="4" /><path d="M12 2v2M4 10h2M6.5 4.5 8 6M17.5 4.5 16 6" strokeWidth="0.9" />
    </g>
  ),
  hvac: (
    <g {...common}>
      <rect x="12" y="12" width="40" height="30" /><circle cx="32" cy="27" r="10" />
      <path d="M32 17v20M22 27h20M25 20l14 14M39 20 25 34" strokeWidth="0.7" />
      <path d="M8 42h48" /><path d="M16 42v4M48 42v4" /><path d="M52 18h6v6" strokeWidth="0.9" />
    </g>
  ),
  windows: (
    <g {...common}>
      <rect x="16" y="6" width="32" height="38" /><rect x="19" y="9" width="26" height="16" /><rect x="19" y="27" width="26" height="14" />
      <path d="M12 46h40" strokeWidth="2" /><path d="M8 6v38M6 6h4M6 44h4" strokeWidth="0.8" />
    </g>
  ),
  fence: (
    <g {...common}>
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${8 + i * 9.6} 42V${14 + (i % 2)}l3-4 3 4V42`} />)}
      <path d="M4 20h56M4 34h56" strokeWidth="1" /><path d="M2 42h60" />
      <path d="M8 47h50M8 45v4M58 45v4" strokeWidth="0.8" />
    </g>
  ),
};

export default function Sketch({ name, className = "h-12 w-16" }: { name: string; className?: string }) {
  return <svg viewBox="0 0 64 50" className={className} aria-hidden>{SK[name] ?? SK.roof}</svg>;
}

/** Cross-section of a house with numbered callouts, used on the home page. */
export function HouseDiagram({ className = "" }: { className?: string }) {
  const n = (x: number, y: number, k: number) => (
    <g key={k}>
      <circle cx={x} cy={y} r="11" fill="#fbf8f2" stroke="#b8392a" strokeWidth="1.6" />
      <text x={x} y={y + 4.5} textAnchor="middle" fontSize="13" fontFamily="var(--font-plexmono)" fill="#b8392a" fontWeight="600">{k}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 520 380" className={className} role="img" aria-label="Line drawing of a house showing roof, solar panels, HVAC unit, windows and fence">
      <g fill="none" stroke="#1e4a72" strokeLinecap="round" strokeLinejoin="round">
        {/* ground */}
        <path d="M10 330h500" strokeWidth="1.6" />
        <path d="M10 336h500" strokeWidth="0.6" strokeDasharray="3 4" />
        {/* house body */}
        <path d="M120 330V190h260v140" strokeWidth="1.8" />
        {/* roof */}
        <path d="M95 200 250 85l155 115" strokeWidth="1.8" />
        <path d="M95 200h310" strokeWidth="0.8" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${112 + i * 13.5} ${188 - i * 10}H${388 - i * 13.5}`} strokeWidth="0.6" />)}
        {/* chimney */}
        <path d="M300 125V98h22v43" strokeWidth="1.4" />
        {/* solar panels on right slope */}
        <path d="M268 112 330 158 312 172 250 126z" strokeWidth="1.4" fill="#e6edf3" />
        <path d="M289 127.5 271 141M310 143 292 156.5M259 119l62 46" strokeWidth="0.7" />
        {/* windows */}
        <rect x="150" y="220" width="48" height="62" strokeWidth="1.4" /><path d="M174 220v62M150 251h48" strokeWidth="0.8" />
        <rect x="302" y="220" width="48" height="62" strokeWidth="1.4" /><path d="M326 220v62M302 251h48" strokeWidth="0.8" />
        {/* door */}
        <path d="M228 330v-78h44v78" strokeWidth="1.4" /><circle cx="264" cy="292" r="2" />
        {/* AC condenser */}
        <rect x="398" y="290" width="46" height="40" strokeWidth="1.4" fill="#fbf8f2" />
        <circle cx="421" cy="310" r="13" strokeWidth="1" /><path d="M421 297v26M408 310h26" strokeWidth="0.6" />
        <path d="M380 300h18" strokeWidth="1" strokeDasharray="2 2" />
        {/* fence */}
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${18 + i * 15} 330V${282 + (i % 2) * 3}l5-7 5 7V330`} strokeWidth="1.1" />)}
        <path d="M14 292h92M14 316h92" strokeWidth="0.9" />
        {/* dimension line */}
        <path d="M120 356h260M120 350v12M380 350v12" strokeWidth="0.8" />
        <path d="M120 356l8-3v6zM380 356l-8-3v6z" fill="#1e4a72" strokeWidth="0.5" />
      </g>
      <text x="250" y="373" textAnchor="middle" fontSize="11" fontFamily="var(--font-plexmono)" fill="#1e4a72" letterSpacing="1">YOUR HOUSE, YOUR ZIP</text>
      {n(180, 150, 1)}{n(318, 102, 2)}{n(462, 280, 3)}{n(212, 236, 4)}{n(60, 262, 5)}
    </svg>
  );
}
