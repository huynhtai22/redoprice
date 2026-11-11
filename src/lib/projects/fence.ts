import { NATIONAL } from "../data";
import { formatUSD } from "../format";
import { regional, triple, type Project } from "../engine";

const F = NATIONAL.fence;
type Mat = keyof typeof F.materials;

export const fence: Project = {
  key: "fence",
  group: "outside",
  permit: F.permit as [number, number, number],
  slug: "fence-cost",
  name: "Fence installation",
  noun: "fence",
  calculatorName: "Fence Cost Calculator",
  short: "Cost per foot and total for wood, vinyl, chain link, aluminum and more.",
  intro: "Set the length, height and material. Add gates and old-fence removal to see the full installed price for your area.",
  icon: "fence",
  variantKey: "material",
  variantNoun: "material",
  variantPlural: "materials",
  quoteNoun: "fence installers",
  inputs: () => [
    {
      key: "material", label: "Fence material", type: "cards",
      options: [
        { value: "wood-privacy", label: "Wood privacy", hint: "Classic, stainable", tag: "Mid-range", swatch: "picket" },
        { value: "vinyl", label: "Vinyl", hint: "No painting", tag: "Mid-range", swatch: "vinyl" },
        { value: "chain-link", label: "Chain link", hint: "Lowest cost", tag: "Budget", swatch: "chain" },
        { value: "aluminum", label: "Aluminum", hint: "Pools, open views", tag: "Premium", swatch: "rail" },
        { value: "wrought-iron", label: "Wrought iron", hint: "Decorative, strong", tag: "Premium", swatch: "iron" },
        { value: "composite", label: "Composite", hint: "Wood look, low upkeep", tag: "Premium", swatch: "composite" },
      ],
    },
    { key: "length", label: "Fence length", help: "Total linear feet, including gates", type: "slider", min: 20, max: 600, step: 5, unit: "ft" },
    {
      key: "height", label: "Height", type: "segmented",
      options: [{ value: "4", label: "4 ft" }, { value: "6", label: "6 ft" }, { value: "8", label: "8 ft" }],
    },
    { key: "gates", label: "Walk gates", type: "slider", min: 0, max: 6, step: 1, unit: "gates" },
    {
      key: "removal", label: "Remove old fence?", type: "segmented",
      options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }],
    },
    {
      key: "terrain", label: "Ground", type: "segmented",
      options: [{ value: "flat", label: "Flat" }, { value: "sloped", label: "Sloped or rocky" }],
    },
  ],
  defaults: () => ({ material: "wood-privacy", length: 150, height: "6", gates: 1, removal: "no", terrain: "flat" }),
  compute: (i, r) => {
    const m = F.materials[i.material as Mat] ?? F.materials["wood-privacy"];
    const L = Number(i.length);
    const hf = F.heightFactor[String(i.height) as "4" | "6" | "8"];
    const lf = i.terrain === "sloped" ? F.slopeLaborFactor : 1;
    const gates = Number(i.gates);
    const rem = i.removal === "yes";
    const rates = [m.low, m.typical, m.high];
    const [low, typical, high] = triple((k) =>
      regional(rates[k] * hf, m.laborShare, r, lf) * L +
      regional(m.gate[k], 0.3, r) * gates +
      (rem ? F.removalPerFt[k] * L * r.laborIndex : 0) +
      F.permit[k] * r.laborIndex,
    );
    return {
      low, typical, high,
      breakdown: [
        { label: "Materials", value: m.typical * hf * (1 - m.laborShare) * r.materialIndex * L },
        { label: "Labor", value: m.typical * hf * m.laborShare * r.laborIndex * lf * L },
        { label: "Gates", value: regional(m.gate[1], 0.3, r) * gates },
        { label: "Old fence removal", value: rem ? F.removalPerFt[1] * L * r.laborIndex : 0 },
        { label: "Permit & survey", value: F.permit[1] * r.laborIndex },
      ].filter((l) => l.value > 0),
      perUnit: { value: typical / L, unit: "linear ft" },
      metrics: [
        { label: "Cost per foot", value: formatUSD(typical / L), hint: "all-in, including gates" },
        { label: "Expected lifespan", value: `${m.lifespanYears} years` },
        { label: "Cost per year of life", value: formatUSD(typical / m.lifespanYears) },
      ],
      notes: [
        "Check your HOA rules and local height limits before ordering. Front-yard fences are often limited to 3 or 4 ft.",
        "Call 811 before digging. Utility locating is free and required in every state.",
      ],
      lifespanYears: m.lifespanYears,
    };
  },
  variants: [
    { value: "wood-privacy", slug: "wood-privacy", label: "Wood privacy fence", blurb: "Pressure-treated pine or cedar boards on wood posts. The most common backyard fence in the US.", pros: ["Moderate upfront cost", "Easy to repair board by board", "Can be stained to match the house"], cons: ["Needs staining every 2 to 3 years", "Posts rot and boards warp over time", "Shortest life of the solid fences"] },
    { value: "vinyl", slug: "vinyl", label: "Vinyl fence", blurb: "PVC panels that never need painting. Popular for privacy fences where low upkeep matters more than cost.", pros: ["Almost no maintenance", "Does not rot or attract insects", "Long warranties"], cons: ["Higher upfront cost than wood", "Can crack in hard freezes or impacts", "Limited colors and harder to repair"] },
    { value: "chain-link", slug: "chain-link", label: "Chain link fence", blurb: "Galvanized or vinyl-coated steel mesh. The cheapest way to fence a large yard or keep pets in.", pros: ["Lowest cost per foot", "Fast to install", "Durable with little upkeep"], cons: ["No privacy unless slats are added", "Industrial look", "Some HOAs ban it"] },
    { value: "aluminum", slug: "aluminum", label: "Aluminum fence", blurb: "Powder-coated aluminum pickets that look like wrought iron without the rust. The usual choice for pool code fences.", pros: ["Rust-proof", "Meets most pool barrier codes", "Works on slopes with racked panels"], cons: ["No privacy", "Less strong than steel", "Higher cost per foot"] },
    { value: "wrought-iron", slug: "wrought-iron", label: "Wrought iron fence", blurb: "Solid steel or iron, often custom fabricated. Strong, decorative and long-lasting with upkeep.", pros: ["Very strong and secure", "Long life", "Adds curb appeal"], cons: ["Among the most expensive", "Needs rust treatment", "Heavy, specialist install"] },
    { value: "composite", slug: "composite", label: "Composite fence", blurb: "Wood fiber and plastic boards that look like wood but do not need staining.", pros: ["Wood look without staining", "Resists rot and insects", "Long warranties"], cons: ["Highest upfront cost here", "Can fade in strong sun", "Fewer installers"] },
  ],
  costFactors: [
    { title: "Length and layout", body: "Fences are priced per linear foot. Corners, ends and gates need extra posts and hardware, so short, broken-up runs cost more per foot than long straight ones." },
    { title: "Material and height", body: "Material sets the base price. Going from 6 ft to 8 ft adds roughly a third, because of taller posts, deeper holes and more material." },
    { title: "Gates", body: "Each walk gate adds a few hundred dollars, more for metal or double drive gates. Automatic gate openers are a separate project." },
    { title: "Ground conditions", body: "Slopes need stepped or racked panels and rocky ground can need hole augers or core drilling. Both add labor." },
    { title: "Removal and permits", body: "Tearing out and hauling away an old fence costs a few dollars per foot. Many cities require a permit and some require a property survey." },
  ],
  faqs: [
    { q: "How much does a fence cost per foot?", a: "Installed, chain link usually runs in the teens to mid-twenties per foot, wood privacy fences around $20 to $40, vinyl and aluminum in the $30s to $50s, and wrought iron or composite higher. Your location, height and gates change this, which the calculator accounts for." },
    { q: "What is the cheapest privacy fence?", a: "A 6 ft pressure-treated wood fence is usually the lowest-cost full privacy option. Chain link with privacy slats is cheaper but looks utilitarian." },
    { q: "Do I need a permit for a fence?", a: "Many cities require one, especially for fences over 6 ft, pool fences or front-yard fences. Check with your city building department and your HOA before ordering materials." },
    { q: "Who pays for a fence between neighbors?", a: "It depends on state law and agreement. Some states have good-neighbor fence laws that split costs on boundary fences. Get any agreement in writing and confirm the property line first." },
  ],
  relatedGuides: ["vinyl-vs-wood-fence", "how-to-read-a-contractor-quote", "questions-to-ask-before-hiring-a-contractor"],
};
