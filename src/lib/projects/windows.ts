import { NATIONAL } from "../data";
import { formatUSD } from "../format";
import { regional, triple, type Project } from "../engine";

const W = NATIONAL.windows;
type Mat = keyof typeof W.materials;

export const windows: Project = {
  key: "windows",
  slug: "window-replacement-cost",
  name: "Window replacement",
  noun: "window",
  calculatorName: "Window Replacement Cost Calculator",
  short: "Per-window and total cost by frame material, style and glass.",
  intro: "Choose how many windows, the frame material and style. See the per-window and total price for your area.",
  icon: "window",
  variantKey: "material",
  variantNoun: "frame material",
  variantPlural: "frame materials",
  quoteNoun: "window installers",
  inputs: () => [
    {
      key: "material", label: "Frame material", type: "cards",
      options: [
        { value: "vinyl", label: "Vinyl", hint: "Best value", tag: "Budget", swatch: "frame-white" },
        { value: "aluminum", label: "Aluminum", hint: "Slim, mild climates", tag: "Budget", swatch: "frame-metal" },
        { value: "fiberglass", label: "Fiberglass", hint: "Strong, efficient", tag: "Mid-range", swatch: "frame-fiber" },
        { value: "composite", label: "Composite", hint: "Wood look", tag: "Mid-range", swatch: "frame-comp" },
        { value: "wood", label: "Wood", hint: "Classic, historic", tag: "Premium", swatch: "frame-wood" },
      ],
    },
    { key: "count", label: "Number of windows", type: "slider", min: 1, max: 40, step: 1, unit: "windows" },
    {
      key: "style", label: "Window style", type: "select",
      options: [
        { value: "double-hung", label: "Double-hung" },
        { value: "slider", label: "Sliding" },
        { value: "casement", label: "Casement" },
        { value: "picture", label: "Picture (fixed)" },
        { value: "bay-bow", label: "Bay or bow" },
      ],
    },
    {
      key: "glass", label: "Glass", type: "segmented",
      options: [{ value: "double", label: "Double pane" }, { value: "triple", label: "Triple pane" }],
    },
    {
      key: "install", label: "Installation", type: "segmented",
      options: [
        { value: "insert", label: "Insert", hint: "Keeps the old frame" },
        { value: "full-frame", label: "Full frame", hint: "Down to the studs" },
      ],
    },
  ],
  defaults: () => ({ material: "vinyl", count: 10, style: "double-hung", glass: "double", install: "insert" }),
  compute: (i, r) => {
    const m = W.materials[i.material as Mat] ?? W.materials.vinyl;
    const n = Number(i.count);
    const sf = W.styleFactor[i.style as keyof typeof W.styleFactor] ?? 1;
    const gf = i.glass === "triple" ? W.tripleGlazingFactor : 1;
    const lf = i.install === "full-frame" ? W.fullFrameLaborFactor : 1;
    const rates = [m.low, m.typical, m.high];
    const [low, typical, high] = triple((k) => regional(rates[k] * sf * gf, m.laborShare, r, lf) * n + W.permit[k] * r.laborIndex);
    const per = (typical - W.permit[1] * r.laborIndex) / n;
    return {
      low, typical, high,
      breakdown: [
        { label: "Windows & materials", value: m.typical * sf * gf * (1 - m.laborShare) * r.materialIndex * n },
        { label: "Installation labor", value: m.typical * sf * gf * m.laborShare * r.laborIndex * lf * n },
        { label: "Permit", value: W.permit[1] * r.laborIndex },
      ].filter((l) => l.value > 0),
      perUnit: { value: per, unit: "window" },
      metrics: [
        { label: "Per window, installed", value: formatUSD(per) },
        { label: "Expected lifespan", value: `${m.lifespanYears} years` },
      ],
      notes: [
        "Assumes standard sizes (about 3 ft x 5 ft). Large, custom-shaped or egress windows cost more.",
        "Homes built before 1978 need lead-safe (EPA RRP) work practices, which can add to labor.",
      ],
      lifespanYears: m.lifespanYears,
    };
  },
  variants: [
    { value: "vinyl", slug: "vinyl", label: "Vinyl windows", blurb: "PVC frames with insulated chambers. The best-selling replacement window in the US because of price and efficiency.", pros: ["Lowest cost for good efficiency", "No painting", "Wide choice of brands"], cons: ["Limited colors, especially dark ones", "Can warp under extreme heat", "Bulkier frames than fiberglass"] },
    { value: "aluminum", slug: "aluminum", label: "Aluminum windows", blurb: "Thin, strong metal frames, mostly used in mild and coastal climates and modern designs.", pros: ["Slim sightlines", "Strong, good for large glass", "Low upfront cost"], cons: ["Conducts heat and cold", "Condensation in cold climates", "Shorter life of seals"] },
    { value: "fiberglass", slug: "fiberglass", label: "Fiberglass windows", blurb: "Glass-fiber frames that expand at the same rate as glass, so seals last longer.", pros: ["Very stable and strong", "Paintable", "Excellent efficiency"], cons: ["Costs more than vinyl", "Fewer manufacturers", "Longer lead times"] },
    { value: "composite", slug: "composite", label: "Composite windows", blurb: "Wood fiber and polymer frames that look like wood with lower upkeep.", pros: ["Wood look", "Rot resistant", "Good efficiency"], cons: ["Higher cost than vinyl", "Mostly sold through specific brands", "Fewer style options"] },
    { value: "wood", slug: "wood", label: "Wood windows", blurb: "Solid wood or clad-wood frames, often required in historic districts.", pros: ["Classic look", "Natural insulator", "Can be refinished"], cons: ["Most expensive", "Needs painting and upkeep", "Rot if neglected"] },
  ],
  costFactors: [
    { title: "Frame material", body: "Vinyl is the price baseline. Fiberglass and composite usually cost 30% to 50% more, wood more again." },
    { title: "Style and size", body: "Casements and picture windows cost a bit more than double-hung; bay and bow windows cost several times a standard window." },
    { title: "Insert vs full-frame", body: "An insert slides into the existing frame and is fastest. Full-frame replacement removes everything down to the rough opening, which costs more labor but fixes rot and air leaks." },
    { title: "Glass package", body: "Low-E coatings and argon fill are standard on most good windows. Triple pane adds cost and pays back mainly in cold climates." },
  ],
  faqs: [
    { q: "How much does it cost to replace a window?", a: "A standard vinyl double-hung replacement window usually costs several hundred dollars to around $1,100 installed, more for premium frames and styles. The calculator adjusts for your area." },
    { q: "Is it cheaper to replace all windows at once?", a: "Usually yes per window, because the crew sets up once. Many installers discount whole-house jobs." },
    { q: "Do new windows pay for themselves in energy savings?", a: "Rarely on energy alone; savings are often a few hundred dollars a year. The bigger benefits are comfort, noise, less upkeep and resale value." },
  ],
  relatedGuides: ["window-insert-vs-full-frame", "how-to-read-a-contractor-quote", "questions-to-ask-before-hiring-a-contractor"],
};
