// Fallback map for catalogue images.
//
// If `public/catalogue` is present, Next serves those local optimised images.
// If the folder is accidentally missing from GitHub/Vercel, the route
// `/catalogue/[file]` uses this map to fetch the same image from the original
// Google Drive folder, so the storefront never shows blank product images.

export const CATALOGUE_IMAGE_IDS: Record<string, string> = {
  "ivory-occasion-gown-1.jpg": "1dQUFKz5peRQhn_oMg19lL7NBzcaHQfu-",
  "ivory-occasion-gown-2.jpg": "1mKCqPhbsZUUZIDakUNslU8ANyuyFnir6",
  "mauve-signature-set-1.jpg": "1ZJWyV-JnD6WGsokbqCycqT2Lt8mbVkXV",
  "mauve-signature-set-2.jpg": "1Pi8YOmoC2HjSq9XtsizkzJsdaLDGDzYT",
  "teal-evening-piece-1.jpg": "13V5Vcv1l-L4TpNmsZ1CQKtY40CvM8TYW",
  "teal-evening-piece-2.jpg": "1_k99Q-ITWmwz5UtbO7I1_lhdZud5U08Y",
  "burgundy-statement-1.jpg": "1uOOldT8gUVRmPR55xA3vd6-irENrr1QB",
  "burgundy-statement-2.jpg": "1_ZzjLMGr2P4xVBRemrAqEFL2fut-r3pS",
  "amber-heritage-look-1.jpg": "19dO3rLq1JhrWverS4aDWGCzZsku3Sp58",
  "amber-heritage-look-2.jpg": "1v0B0J_Fscp29f_DVYYucvGbZVOIeR_02",
  "amber-heritage-look-3.jpg": "1aSOtZMbP5NuesyGwUV7wlcLNi-c3HI62",
  "charcoal-draped-look-1.jpg": "1OsLifbovHANqhw2qZT1kj4J6805xTHSM",
  "charcoal-draped-look-2.jpg": "1-w3dEaXATG_OLRCfdz1lkfjgZ0K9j0bc",
  "charcoal-draped-look-3.jpg": "1psYptTsgB1aAo3w5CiBkvJhqDmogy35v",
  "camel-tailored-coat-1.jpg": "1ZvCyDml7e2eqPdH5Us7CbXe4LmF6BwoG",
  "camel-tailored-coat-2.jpg": "1t-BHKan0ASlg9szNVPTcgfOwDXvwZlYk",
  "olive-safari-set-1.jpg": "13MoWqw1vxnjKps-QkO5pw1uAZuE0eFfQ",
  "olive-safari-set-2.jpg": "1_vYmEyvGrCyE1R3k5gzauSvSBMvajggh",
  "midnight-column-1.jpg": "1Zm00gxBfi5z8k6k9hnMoWhvz4iRdSNIO",
  "midnight-column-2.jpg": "1qe9BTaV-53XGOTlo4G0cFfmcYf1Y_uqd",
  "periwinkle-drape-1.jpg": "1xc6hsO5E1Ff-nyLdP2k8yh6f2VIaD87J",
  "sand-linen-look-1.jpg": "1hQOYbIu1pL2DcGQTcpTW2x4QBfxVI8f7",
  "noir-editorial-1.jpg": "1YyKO4X_V9tlt9L1_R4qhd4GRHkBiiXfQ",
  "editorial-a.jpg": "1El8CtPIxeZhrO_l0HeSbFiCgxeRyCQdf",
  "editorial-b.jpg": "1e1WjeqpIfH3GsU-AdHhJWcSa_Yl4vmcO",
  "editorial-hero.jpg": "1JjJR7n9gvnca7XPuG8LFQjgMHKJE8-mq",
  "OSSZ_Logo_jpeg.jpg": "1TflppFPbWeuCjS0BM_GfgWaO8H1VkBh3",
  "OSSZ_Logo_2_jpeg.jpg": "1a7yK9i49ismfOn_zXXSGAHST3Aj5OfdF",
};

export function driveThumbnailUrl(file: string, size = "w1800") {
  const id = CATALOGUE_IMAGE_IDS[file];
  if (!id) return null;
  return `https://drive.google.com/thumbnail?id=${id}&sz=${size}`;
}
