import { HOUSING, NATIONAL } from "../data";
import { formatNum, formatUSD } from "../format";
import { regional, triple, type Project } from "../engine";

const R = NATIONAL.roofing;
type Mat = keyof typeof R.materials;

export const roofing: Project = {
  key: "roofing",
  slug: "roof-replacement-cost",
  name: "Roof replacement",
  noun: "roof",
  calculatorName: "Roof Replacement Cost Calculator",
  short: "Price a new roof by size, pitch and material, adjusted for your area.",
  intro:
    "Enter your home size and pick a material. The estimate updates as you go and is adjusted for labor and material costs where you live.",
  icon: "roof",
  variantKey: "material",
  variantNoun: "material",
  variantPlural: "materials",
  quoteNoun: "roofers",
  inputs: () => [
    {
      key: "material", label: "Roofing material", type: "cards",
      options: [
        { value: "architectural-asphalt", label: "Architectural shingles", hint: "Most common", tag: "Mid-range", swatch: "shingle" },
        { value: "three-tab-asphalt", label: "3-tab shingles", hint: "Lowest upfront", tag: "Budget", swatch: "shingle-flat" },
        { value: "metal-shingles", label: "Metal shingles", hint: "Light, long-lasting", tag: "Mid-range", swatch: "metal-shingle" },
        { value: "standing-seam-metal", label: "Standing seam metal", hint: "50+ years", tag: "Premium", swatch: "seam" },
        { value: "concrete-tile", label: "Concrete tile", hint: "Heavy, durable", tag: "Premium", swatch: "tile" },
        { value: "clay-tile", label: "Clay tile", hint: "Hot climates", tag: "Premium", swatch: "clay" },
        { value: "slate", label: "Natural slate", hint: "Century roof", tag: "Premium", swatch: "slate" },
        { value: "wood-shake", label: "Wood shake", hint: "Rustic look", tag: "Mid-range", swatch: "shake" },
      ],
    },
    { key: "homeSqft", label: "Home size", help: "Total heated living area", type: "slider", min: 600, max: 5000, step: 50, unit: "sq ft" },
    {
      key: "stories", label: "Stories", type: "segmented",
      options: [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3+" }],
    },
    {
      key: "pitch", label: "Roof steepness", type: "segmented",
      options: [
        { value: "low", label: "Low", hint: "Walkable, up to 4/12" },
        { value: "medium", label: "Medium", hint: "5/12 to 7/12" },
        { value: "steep", label: "Steep", hint: "8/12 to 10/12" },
        { value: "verysteep", label: "Very steep", hint: "11/12 and up" },
      ],
    },
    {
      key: "tearOff", label: "Old layers to remove", type: "segmented",
      options: [
        { value: "0", label: "None", hint: "New build or overlay" },
        { value: "1", label: "1 layer" },
        { value: "2", label: "2 layers" },
      ],
    },
  ],
  defaults: (r) => ({
    material: "architectural-asphalt",
    homeSqft: HOUSING.typicalHomeSqft[r.state.code] ?? 1800,
    stories: "1",
    pitch: "medium",
    tearOff: "1",
  }),
  compute: (i, r) => {
    const m = R.materials[i.material as Mat] ?? R.materials["architectural-asphalt"];
    const stories = String(i.stories) as keyof typeof R.storiesLaborFactor;
    const p = R.pitch[i.pitch as keyof typeof R.pitch] ?? R.pitch.medium;
    const footprint = Number(i.homeSqft) / Number(stories);
    const area = footprint * p.areaFactor * R.overhangFactor;
    const lf = p.laborFactor * R.storiesLaborFactor[stories];
    const tear = R.tearOffPerSqFt[String(i.tearOff) as "0" | "1" | "2"];
    const rates = [m.low, m.typical, m.high];

    const [low, typical, high] = triple((k) =>
      regional(rates[k], m.laborShare, r, lf) * area + tear[k] * area * r.laborIndex + R.permit[k] * r.laborIndex,
    );
    const materials = m.typical * (1 - m.laborShare) * r.materialIndex * area;
    const labor = m.typical * m.laborShare * r.laborIndex * lf * area;
    const removal = tear[1] * area * r.laborIndex;
    const permit = R.permit[1] * r.laborIndex;
    const squares = area / 100;

    return {
      low, typical, high,
      breakdown: [
        { label: "Materials", value: materials },
        { label: "Labor", value: labor },
        { label: "Tear-off & disposal", value: removal },
        { label: "Permit & inspection", value: permit },
      ].filter((l) => l.value > 0),
      perUnit: { value: typical / area, unit: "sq ft of roof" },
      metrics: [
        { label: "Roof area", value: `${formatNum(Math.round(area / 10) * 10)} sq ft`, hint: `${formatNum(squares, 1)} roofing squares` },
        { label: "Cost per square", value: formatUSD(typical / squares), hint: "1 square = 100 sq ft" },
        { label: "Expected lifespan", value: `${m.lifespanYears} years` },
        { label: "Cost per year of roof life", value: formatUSD(typical / m.lifespanYears) },
      ],
      notes: [
        "Roof area is estimated from your footprint, pitch and a typical 8% for overhangs. A roofer's measurement can differ by 10% or more.",
        "Not included: decking (plywood) replacement, chimney rebuilds, skylights and gutters. Rotten decking typically adds $70 to $120 per sheet.",
      ],
      lifespanYears: m.lifespanYears,
    };
  },
  variants: [
    {
      value: "architectural-asphalt", slug: "architectural-shingles", label: "Architectural shingles",
      blurb: "Laminated asphalt shingles with a dimensional look. They are what most US roofers install by default and the benchmark every other material is compared against.",
      pros: ["Lowest cost per year among mainstream options", "Every roofer installs them, so quotes are easy to compare", "Class 4 impact-rated versions can lower insurance premiums in hail states"],
      cons: ["Shorter life than metal or tile", "Granule loss and curling in hot climates", "Wind ratings vary a lot between product lines"],
    },
    {
      value: "three-tab-asphalt", slug: "3-tab-shingles", label: "3-tab shingles",
      blurb: "Flat, single-layer asphalt shingles. Cheapest upfront, but many manufacturers have scaled back their 3-tab lines and they are mostly used on rentals and quick sales.",
      pros: ["Lowest upfront price", "Light, so overlays are sometimes possible", "Fast to install"],
      cons: ["Shortest lifespan", "Lower wind ratings", "Can look dated and hurt resale appeal"],
    },
    {
      value: "metal-shingles", slug: "metal-shingles", label: "Metal shingles",
      blurb: "Stamped steel or aluminum panels shaped like shingles, shake or tile, often with a stone coating. A middle ground between asphalt and standing seam.",
      pros: ["Two to three times the life of asphalt", "Light weight, often no structural changes", "Good fire and wind resistance"],
      cons: ["Fewer installers than for asphalt", "Dents from large hail on uncoated panels", "Higher upfront cost"],
    },
    {
      value: "standing-seam-metal", slug: "standing-seam-metal", label: "Standing seam metal",
      blurb: "Long vertical panels joined by raised seams with hidden fasteners. The premium metal roof, popular in snow country and on modern homes.",
      pros: ["Can last 50 years or more", "Sheds snow and rain fast", "Reflective finishes cut cooling costs"],
      cons: ["Among the highest upfront costs", "Needs a specialist crew", "Can be noisy in rain without good underlayment"],
    },
    {
      value: "concrete-tile", slug: "concrete-tile", label: "Concrete tile",
      blurb: "Molded concrete tiles common in the Southwest, Florida and California. Durable and fire resistant, but heavy.",
      pros: ["Long life with low maintenance", "Excellent fire resistance", "Handles heat well"],
      cons: ["Heavy; the structure may need checking", "Tiles crack if walked on", "Underlayment usually needs replacing around year 20 to 25"],
    },
    {
      value: "clay-tile", slug: "clay-tile", label: "Clay tile",
      blurb: "Kiln-fired clay tiles with color that does not fade. The classic Spanish and Mediterranean roof.",
      pros: ["Can last 75 years or more", "Color is permanent", "Very fire resistant"],
      cons: ["High cost", "Heavy and brittle", "Freeze-thaw cycles can damage lower grades"],
    },
    {
      value: "slate", slug: "slate", label: "Natural slate",
      blurb: "Split natural stone. The longest-lasting residential roof, found mostly on older homes in the Northeast.",
      pros: ["Lifespan measured in generations", "Fireproof", "Distinctive look that adds value"],
      cons: ["The most expensive option", "Very heavy", "Few qualified installers and costly repairs"],
    },
    {
      value: "wood-shake", slug: "wood-shake", label: "Wood shake",
      blurb: "Split cedar shakes with a natural, rustic look. Needs more upkeep and is restricted in some wildfire zones.",
      pros: ["Natural look", "Good insulation value", "Lighter than tile or slate"],
      cons: ["Needs regular treatment", "Fire restrictions in some areas", "Moss and rot in wet climates"],
    },
  ],
  costFactors: [
    { title: "Roof size and shape", body: "Roofers price by the square (100 sq ft of roof surface). A steeper or more complex roof has more surface than its footprint, plus more ridges, valleys and flashing to cut around." },
    { title: "Material", body: "Material choice moves the price more than anything else. Asphalt is the baseline; metal roughly doubles it, tile and slate can triple or quadruple it. Compare cost per year of roof life, not just the upfront price." },
    { title: "Steepness and height", body: "Above about 8/12 pitch, crews need harnesses, roof jacks and more time, so labor goes up. Two- and three-story homes add staging and material handling." },
    { title: "Tear-off", body: "Removing old layers and paying for disposal adds roughly $1 to $3 per square foot. Most codes allow at most two layers, and a full tear-off lets the roofer inspect the decking." },
    { title: "Where you live", body: "Roofing labor costs differ by more than 40% between low- and high-cost metros. This estimate applies a regional labor and material index to the national rates." },
    { title: "Hidden extras", body: "Rotten decking, new flashing, ventilation upgrades and ice-and-water shield in snow states are the usual change orders. Ask for per-sheet decking prices in writing." },
  ],
  faqs: [
    { q: "How much does a new roof cost?", a: "For a typical 1,800 sq ft single-story home with architectural shingles and one layer to remove, most homeowners pay somewhere around $11,000 to $17,000 before regional adjustment. Use the calculator for a number based on your home and location." },
    { q: "How do roofers measure a roof?", a: "They measure the actual sloped surface, usually with satellite measurement reports or on-site, and convert it to squares (100 sq ft). They then add 10% to 15% for waste. Ask to see the measurement report so you can compare quotes on the same area." },
    { q: "Is it cheaper to roof over existing shingles?", a: "An overlay skips the tear-off cost, but it hides decking problems, adds weight and can shorten the new roof's life. Many manufacturers limit warranties on overlays. Most roofers recommend a full tear-off." },
    { q: "Will insurance pay for my new roof?", a: "Insurance covers sudden damage such as hail or wind, not age-related wear. If you have storm damage, get the adjuster's estimate and compare it with this calculator and your roofer's quote." },
    { q: "When is the best time to replace a roof?", a: "Late fall and early spring are often less busy than summer, which can mean faster scheduling and more room to negotiate. Avoid waiting until a leak forces an emergency job." },
  ],
  relatedGuides: ["repair-or-replace-roof", "how-to-read-a-contractor-quote", "questions-to-ask-before-hiring-a-contractor"],
};
