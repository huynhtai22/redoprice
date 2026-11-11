/**
 * Editorial photography. All images are free to use under the Unsplash License
 * (https://unsplash.com/license): commercial use allowed, no permission needed.
 * We credit the photographer anyway, the way a newsroom would.
 * Images are served by Unsplash's own CDN (imgix) and resized with URL params, so they
 * cost nothing against Vercel image optimization limits.
 * To swap a photo, change `id`, `alt`, `credit` and `page`. Keep alt text literal.
 */
export type Photo = { id: string; alt: string; credit: string; page: string };

export const PHOTOS: Record<string, Photo> = {
  home: {
    id: "photo-1761401395640-5c45422f2a99",
    alt: "Brick house with a green lawn and mature trees",
    credit: "Roger Starnes Sr",
    page: "https://unsplash.com/photos/a-brick-house-with-a-green-lawn-and-trees-RUy7Q-8K6ag",
  },
  roofing: {
    id: "photo-1643225523483-e2c434191bba",
    alt: "Roofer carrying a bundle of asphalt shingles across a house roof",
    credit: "Zohair Mirza",
    page: "https://unsplash.com/photos/person-carrying-shingles-on-roof-4XMHsy4Rvi8",
  },
  solar: {
    id: "photo-1635424824849-1b09bdcc55b1",
    alt: "Installer fastening solar panel racking on a residential roof",
    credit: "Raze Solar",
    page: "https://unsplash.com/photos/a-man-working-on-a-roof-with-a-power-drill-Scaj0T40nFI",
  },
  solarCrew: {
    id: "photo-1635424709961-f3a150459ad4",
    alt: "Two installers working on the roof of a house",
    credit: "Raze Solar",
    page: "https://unsplash.com/photos/two-men-working-on-the-roof-of-a-house-RGkNFjRPyO0",
  },
  hvac: {
    id: "photo-1776860155275-eee24bfb1dee",
    alt: "Outdoor heat pump unit beside a house",
    credit: "alpha innotec",
    page: "https://unsplash.com/photos/modern-house-exterior-with-heat-pump-unit-kblddocwPa0",
  },
  windows: {
    id: "photo-1572739275114-ec3764ba1477",
    alt: "White wood-framed window",
    credit: "Nick Romanov",
    page: "https://unsplash.com/photos/white-wooden-framed-glass-window-Um6AfKJSJPQ",
  },
  fence: {
    id: "photo-1621450078372-234d2cbfb7c1",
    alt: "Brown and gray wooden board fence",
    credit: "Peter Burdon",
    page: "https://unsplash.com/photos/brown-and-gray-wooden-fence-aAdt08ogxNU",
  },
  // Projects added in the 20-project expansion (verified free Unsplash License listings, 2026-11-11)
  gutters: {
    id: "photo-1779755376652-22ca6eba86b8",
    alt: "House roof edge and gutter system against a grey sky",
    credit: "Miles Smith",
    page: "https://unsplash.com/photos/a-house-roof-and-gutter-system-against-a-grey-sky-kq3l2WLNp8Y",
  },
  siding: {
    id: "photo-1773101883541-42a4881daef3",
    alt: "Blue siding house with white trim",
    credit: "Franco Debartolo",
    page: "https://unsplash.com/photos/blue-siding-house-with-white-trim-and-outdoor-light-3PScsGdblRw",
  },
  deck: {
    id: "photo-1623195372782-57a1486af9a9",
    alt: "Wooden deck with a table and chairs",
    credit: "Gilberto Olimpio",
    page: "https://unsplash.com/photos/a-wooden-deck-with-a-table-and-chairs-on-it-YlLP79wS4sg",
  },
  exteriorPaint: {
    id: "photo-1759406066673-f76869a4e6db",
    alt: "Man painting the side of a brick house",
    credit: "The New York Public Library",
    page: "https://unsplash.com/photos/man-painting-the-side-of-a-brick-house-THDa0DcUmj0",
  },
  driveway: {
    id: "photo-1781637202423-33ec5b47e52e",
    alt: "Concrete driveway in front of a white garage door",
    credit: "web seo",
    page: "https://unsplash.com/photos/a-concrete-driveway-in-front-of-a-white-garage-door-hpg1LexD52Q",
  },
  garageDoor: {
    id: "photo-1770756051811-1612ac8bedfa",
    alt: "Modern garage doors on a white house",
    credit: "GoodLifeConstruction",
    page: "https://unsplash.com/photos/modern-garage-doors-on-a-white-house-3qRx6B4cT6g",
  },
  waterHeater: {
    id: "photo-1780445392462-b7761551820c",
    alt: "Residential water heater and air conditioner on an exterior wall",
    credit: "Sergio Martins",
    page: "https://unsplash.com/photos/residential-water-heater-and-air-conditioner-on-an-exterior-wall-Mqtt4KNB8Ck",
  },
  electricalPanel: {
    id: "photo-1758101755915-462eddc23f57",
    alt: "Electrician testing an electrical panel with a multimeter",
    credit: "Toolmash Expo",
    page: "https://unsplash.com/photos/electrician-testing-electrical-panel-with-multimeter-PkHf7BUWbtk",
  },
  insulation: {
    id: "photo-1607400201889-565b1ee75f8e",
    alt: "Worker at a wall filled with pink fiberglass insulation",
    credit: "Erik Mclean",
    page: "https://unsplash.com/photos/person-installing-wiring-in-wall-insulation-aCshJn3y93s",
  },
  sewer: {
    id: "photo-1749532125405-70950966b0e5",
    alt: "Plumber repairing plumbing in a bathroom",
    credit: "bhagya laxmi",
    page: "https://unsplash.com/photos/a-plumber-repairs-plumbing-in-a-bathroom-jaP5ClBdIyU",
  },
  kitchen: {
    id: "photo-1618832515490-e181c4794a45",
    alt: "Kitchen under renovation with white cabinets covered in plastic",
    credit: "immo RENOVATION",
    page: "https://unsplash.com/photos/kitchen-renovation-with-white-cabinets-UqNEbyRQ660",
  },
  bathroom: {
    id: "photo-1771372012124-f7696f374a5a",
    alt: "Modern bathroom with freestanding tub and double vanity",
    credit: "GoodLifeConstruction",
    page: "https://unsplash.com/photos/modern-bathroom-with-freestanding-tub-and-double-vanity-p9A8tpM93Hk",
  },
  flooring: {
    id: "photo-1783125127015-bf513362480b",
    alt: "Room with wood floors and large windows",
    credit: "Salvo Media LLC",
    page: "https://unsplash.com/photos/spacious-modern-room-with-wood-floors-large-windows-and-bar-J8xYIlwI2Qc",
  },
  interiorPaint: {
    id: "photo-1693985120993-e9b203ce7631",
    alt: "Person using a paint roller on a wall",
    credit: "Andrew Itaga",
    page: "https://unsplash.com/photos/a-person-using-a-paint-roller-to-paint-a-wall-rMVjOX8nm2U",
  },
  basement: {
    id: "photo-1782353921981-bb73a53a7482",
    alt: "Unfinished basement with exposed joists and stairs",
    credit: "Josh Lemmon",
    page: "https://unsplash.com/photos/spacious-unfinished-basement-with-exposed-joists-support-poles-and-stairs-hV-fLWrDF3I",
  },
};

export const photoUrl = (id: string, w: number) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=70&w=${w}`;

export const photoFor = (key: string): Photo | undefined => PHOTOS[key];
