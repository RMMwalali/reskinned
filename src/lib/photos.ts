// Stock photography from Pexels (free to use under the Pexels License).
// Credited on /method. Served through Next's image optimiser, so pages and the
// 3D scene load them from our own origin.

import type { StyleId } from "./edges";

export type Photo = { id: number; by: string; alt: string };

export const STYLE_PHOTOS: Record<StyleId, Photo> = {
  out: { id: 14296197, by: "Jedidiah-Jordan O.", alt: "Woman with natural curly hair outdoors" },
  "loose-updo": { id: 36244209, by: "abubakar mamman", alt: "Woman with natural hair in a loose high puff" },
  "glueless-wig": { id: 31622486, by: "Ayodeji Fatunla", alt: "Woman with a sleek bob" },
  twists: { id: 30091514, by: "Wings Panic", alt: "Smiling woman with natural hair twists" },
  knotless: { id: 35272483, by: "Celine Ineza", alt: "Back view of long knotless braids" },
  locs: { id: 12530818, by: "davidowaga", alt: "Smiling woman with locs in Nairobi" },
  "sew-in": { id: 36288139, by: "El gringo photo", alt: "Woman with long, sleek straight hair" },
  "box-braids": { id: 13767165, by: "Geezy Photography", alt: "Woman with box braids among leaves" },
  "tight-ponytail": { id: 39944237, by: "Li Chunyu", alt: "Sleek bun seen from behind" },
  cornrows: { id: 32426283, by: "_brunovisual", alt: "Woman with cornrows, hands on her hairline" },
  "glued-wig": { id: 6923351, by: "RDNE Stock project", alt: "Lace wig being styled on a mannequin head" },
};

export const SCENE_PHOTOS = {
  takeA: { id: 6948129, by: "Kampus Production", alt: "Woman with afro hair, head tilted, brushing her hair" },
  takeB: { id: 6948132, by: "Kampus Production", alt: "Woman with afro hair styling it in a mirror" },
  side: { id: 7190007, by: "cottonbro studio", alt: "Side profile of a woman with braids" },
  braiding: { id: 36441633, by: "Nasiru othman", alt: "Woman having her hair braided in a salon" },
  hands: { id: 15576674, by: "Vurzie Kim", alt: "Close-up of hands braiding hair" },
} satisfies Record<string, Photo>;

/** Original image on Pexels' CDN (resized there). */
export const pexels = (id: number, w = 1200) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

/** Same-origin copy through Next's image optimiser (needed for WebGL textures). */
export const local = (id: number, w = 1080) => `/_next/image?url=${encodeURIComponent(pexels(id, 1600))}&w=${w}&q=75`;

export const ALL_CREDITS: Photo[] = [...Object.values(STYLE_PHOTOS), ...Object.values(SCENE_PHOTOS)];
