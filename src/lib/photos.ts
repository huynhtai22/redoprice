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
};

export const photoUrl = (id: string, w: number) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=70&w=${w}`;

export const photoFor = (key: string): Photo | undefined => PHOTOS[key];
