/** Small illustrated material swatches (no photos needed, crisp at any size). */
const S: Record<string, { bg: string; el: React.ReactNode }> = {
  shingle: { bg: "#4a5160", el: <>{[0, 1, 2, 3].map((r) => <g key={r}>{[0, 1, 2, 3, 4].map((c) => <rect key={c} x={c * 14 - (r % 2) * 7} y={r * 11} width="13" height="10" rx="1.5" fill={["#5b6373", "#535a69", "#606878"][(r + c) % 3]} />)}</g>)}</> },
  "shingle-flat": { bg: "#6b6f77", el: <>{[0, 1, 2, 3].map((r) => <rect key={r} x="0" y={r * 11 + 9} width="64" height="1.5" fill="#575b63" />)}{[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => <rect key={`${r}${c}`} x={c * 16 + (r % 2) * 8} y={r * 11} width="1.2" height="9" fill="#575b63" />))}</> },
  "metal-shingle": { bg: "#7a4b3a", el: <>{[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => <path key={`${r}${c}`} d={`M${c * 16 + (r % 2) * 8} ${r * 11 + 10} q8 -9 16 0`} fill="none" stroke="#9a634f" strokeWidth="2" />))}</> },
  seam: { bg: "#2f4f6f", el: <>{[0, 1, 2, 3, 4, 5].map((c) => <rect key={c} x={c * 11 + 4} y="0" width="2.5" height="44" fill="#4a6d90" />)}</> },
  tile: { bg: "#8e6e57", el: <>{[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => <path key={`${r}${c}`} d={`M${c * 14} ${r * 11 + 10} a7 7 0 0 1 14 0`} fill="#a4826a" stroke="#7a5d48" />))}</> },
  clay: { bg: "#b5532f", el: <>{[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => <path key={`${r}${c}`} d={`M${c * 14} ${r * 11 + 10} a7 7 0 0 1 14 0`} fill="#c9673f" stroke="#9b4425" />))}</> },
  slate: { bg: "#3c4350", el: <>{[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={c * 16 + (r % 2) * 8} y={r * 11} width="15" height="10" fill={["#4b5363", "#434a59", "#525a6b"][(r * c) % 3]} />))}</> },
  shake: { bg: "#8a6a45", el: <>{[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4, 5].map((c) => <rect key={`${r}${c}`} x={c * 11 + (r % 2) * 5} y={r * 11} width={9 + ((c + r) % 3)} height="10" fill={["#9c7a52", "#94724b", "#a8865d"][(r + c) % 3]} />))}</> },
  picket: { bg: "#e9dcc6", el: <>{[0, 1, 2, 3, 4, 5].map((c) => <rect key={c} x={c * 11 + 1} y="2" width="10" height="42" fill={["#c9a77c", "#c19f73", "#d1b088"][c % 3]} />)}</> },
  vinyl: { bg: "#e7eaee", el: <>{[0, 1, 2, 3].map((c) => <rect key={c} x={c * 16 + 1} y="0" width="15" height="44" fill="#fbfbfc" stroke="#d5d9df" />)}</> },
  chain: { bg: "#dfe4ea", el: <>{[0, 1, 2, 3, 4, 5, 6].map((c) => <path key={c} d={`M${c * 10 - 10} 0 l22 44 M${c * 10 + 12} 0 l-22 44`} stroke="#8b96a5" strokeWidth="1.4" />)}</> },
  rail: { bg: "#eef1f4", el: <><rect x="0" y="6" width="64" height="3" fill="#222a35" /><rect x="0" y="36" width="64" height="3" fill="#222a35" />{[0, 1, 2, 3, 4, 5, 6, 7].map((c) => <rect key={c} x={c * 8 + 3} y="2" width="2" height="40" fill="#222a35" />)}</> },
  iron: { bg: "#f0ede8", el: <><rect x="0" y="8" width="64" height="3" fill="#1d1d1f" /><rect x="0" y="36" width="64" height="3" fill="#1d1d1f" />{[0, 1, 2, 3, 4, 5].map((c) => <g key={c}><rect x={c * 11 + 4} y="4" width="2.5" height="38" fill="#1d1d1f" /><path d={`M${c * 11 + 5.2} 0 l3 5 h-6z`} fill="#1d1d1f" /></g>)}</> },
  composite: { bg: "#6d5847", el: <>{[0, 1, 2, 3, 4].map((r) => <rect key={r} x="0" y={r * 9} width="64" height="8" fill={["#7b6553", "#735e4c", "#836c59"][r % 3]} />)}</> },
  "frame-white": { bg: "#cfe3f5", el: <><rect x="8" y="4" width="48" height="36" fill="none" stroke="#fff" strokeWidth="5" /><path d="M32 4v36M8 22h48" stroke="#fff" strokeWidth="3" /></> },
  "frame-metal": { bg: "#cfe3f5", el: <><rect x="8" y="4" width="48" height="36" fill="none" stroke="#8a929c" strokeWidth="3" /><path d="M32 4v36" stroke="#8a929c" strokeWidth="2" /></> },
  "frame-fiber": { bg: "#cfe3f5", el: <><rect x="8" y="4" width="48" height="36" fill="none" stroke="#3a3f47" strokeWidth="4" /><path d="M8 22h48" stroke="#3a3f47" strokeWidth="3" /></> },
  "frame-comp": { bg: "#cfe3f5", el: <><rect x="8" y="4" width="48" height="36" fill="none" stroke="#7b5b3e" strokeWidth="4.5" /><path d="M8 22h48" stroke="#7b5b3e" strokeWidth="3" /></> },
  "frame-wood": { bg: "#cfe3f5", el: <><rect x="8" y="4" width="48" height="36" fill="none" stroke="#a0703f" strokeWidth="5.5" /><path d="M32 4v36M8 22h48" stroke="#a0703f" strokeWidth="3" /></> },
  hp: { bg: "#e3edf6", el: <><rect x="12" y="8" width="40" height="30" rx="3" fill="#fff" stroke="#9fb3c8" /><circle cx="32" cy="23" r="10" fill="none" stroke="#5c7fa3" strokeWidth="2" /><path d="M32 13v20M22 23h20" stroke="#5c7fa3" /></> },
  ac: { bg: "#e6f1f7", el: <><rect x="12" y="8" width="40" height="30" rx="3" fill="#fff" stroke="#9fb3c8" />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x="16" y={12 + i * 5} width="32" height="2" fill="#a9bfd3" />)}</> },
  combo: { bg: "#f3ece4", el: <><rect x="8" y="10" width="22" height="30" rx="2" fill="#fff" stroke="#c4b3a0" /><rect x="34" y="16" width="22" height="24" rx="2" fill="#fff" stroke="#9fb3c8" /><path d="M14 30q5-8 10 0" stroke="#e07a3a" strokeWidth="2" fill="none" /></> },
  furnace: { bg: "#f6ebe2", el: <><rect x="20" y="4" width="24" height="38" rx="2" fill="#fff" stroke="#c4b3a0" /><path d="M26 30q6-12 12 0" stroke="#e07a3a" strokeWidth="2.5" fill="none" /></> },
  mini: { bg: "#eef3f7", el: <><rect x="8" y="12" width="48" height="14" rx="5" fill="#fff" stroke="#b5c3d1" /><path d="M14 22h36" stroke="#b5c3d1" /></> },
  panel: { bg: "#d9e6f2", el: <><rect x="6" y="6" width="52" height="32" fill="#1f3b63" />{[1, 2, 3].map((i) => <rect key={i} x={6 + i * 13} y="6" width="1" height="32" fill="#4d6c96" />)}<rect x="6" y="21.5" width="52" height="1" fill="#4d6c96" /></> },
  "panel-premium": { bg: "#d9e6f2", el: <><rect x="6" y="6" width="52" height="32" fill="#0f1b2e" />{[1, 2, 3, 4, 5].map((i) => <rect key={i} x={6 + i * 8.7} y="6" width="0.6" height="32" fill="#2a3b56" />)}</> },
};
export default function Swatch({ name, className = "" }: { name?: string; className?: string }) {
  const s = S[name ?? ""] ?? S.shingle;
  return (
    <svg viewBox="0 0 64 44" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <rect width="64" height="44" fill={s.bg} />{s.el}
    </svg>
  );
}
