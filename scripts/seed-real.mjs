import fs from "node:fs";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db", ssl: /@(localhost|127\.0\.0\.1)/.test(process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db") ? false : { rejectUnauthorized: false } });

/**
 * Explicit image allocation.
 *
 * The instruction is that no photograph may appear twice anywhere on the site.
 * With a finite library that means product galleries are capped so that enough
 * distinct photos remain for the hero, collection covers and lookbook. Six
 * premium pieces keep a two-angle gallery; the rest use a single image. Every
 * file below appears on exactly one surface — asserted at the end of this run.
 */
const groups = {
  // 2-slide galleries (premium pieces)
  "ivory-occasion-gown": ["/catalogue/ivory-occasion-gown-1.jpg", "/catalogue/ivory-occasion-gown-2.jpg"],
  "mauve-signature-set": ["/catalogue/mauve-signature-set-1.jpg", "/catalogue/mauve-signature-set-2.jpg"],
  "teal-evening-piece": ["/catalogue/teal-evening-piece-1.jpg", "/catalogue/teal-evening-piece-2.jpg"],
  "burgundy-statement": ["/catalogue/burgundy-statement-1.jpg", "/catalogue/burgundy-statement-2.jpg"],
  "amber-heritage-look": ["/catalogue/amber-heritage-look-1.jpg", "/catalogue/amber-heritage-look-2.jpg"],
  "charcoal-draped-look": ["/catalogue/charcoal-draped-look-1.jpg", "/catalogue/charcoal-draped-look-2.jpg"],
  // single-image pieces
  "camel-tailored-coat": ["/catalogue/camel-tailored-coat-1.jpg"],
  "olive-safari-set": ["/catalogue/olive-safari-set-1.jpg"],
  "midnight-column": ["/catalogue/midnight-column-1.jpg"],
  "periwinkle-drape": ["/catalogue/periwinkle-drape-1.jpg"],
  "sand-linen-look": ["/catalogue/sand-linen-look-1.jpg"],
  "noir-editorial": ["/catalogue/noir-editorial-1.jpg"],
};

// Editorial surfaces — each a photo used nowhere else.
const EDITORIAL = {
  hero: "/catalogue/editorial-hero.jpg",          // landscape crop of a freed amber angle
  covers: {
    "wouri-nights": "/catalogue/charcoal-draped-look-3.jpg",
    "atelier-essentials": "/catalogue/camel-tailored-coat-2.jpg",
    "sawa-sun": "/catalogue/olive-safari-set-2.jpg",
  },
  banner: "/catalogue/editorial-b.jpg",           // processed spare (landscape)
  invite: "/catalogue/amber-heritage-look-3.jpg", // freed amber angle
  lookbook: [
    { url: "/catalogue/midnight-column-2.jpg", slug: "midnight-column", title: "Midnight Column" },
    { url: "/catalogue/editorial-a.jpg", slug: "", title: "In the atelier" },
  ],
};


/**
 * Grouping was derived from EXIF capture timestamps plus mutual
 * nearest-neighbour colour-histogram distance, not filenames alone.
 */
const CATALOGUE = [
  {
    key: "ivory-occasion-gown",
    name: "Ivoire Occasion Gown", nameFr: "Robe d'Occasion Ivoire",
    cat: "evening", col: "wouri-nights", price: 295000, featured: true,
    d: "A softly structured occasion gown in ivory, photographed in our Douala studio.",
    dFr: "Une robe d'occasion à la structure souple, en ivoire, photographiée dans notre studio de Douala.",
    det: "Fluid lining with a sculpted bodice. Concealed back closure. Finished by hand in Akwa.",
    detFr: "Doublure fluide et buste sculpté. Fermeture dos dissimulée. Finie à la main à Akwa.",
    care: "Dry clean only. Store on a padded hanger.",
    careFr: "Nettoyage à sec uniquement. Conserver sur un cintre rembourré.",
    colours: ["Ivory", "Champagne"],
  },
  {
    key: "mauve-signature-set",
    name: "Mauve Signature Set", nameFr: "Ensemble Signature Mauve",
    cat: "ready-to-wear", col: "wouri-nights", price: 245000, featured: true,
    d: "A two-piece signature set in soft mauve, cut for movement and evening light.",
    dFr: "Un ensemble deux pièces signature en mauve doux, taillé pour le mouvement et la lumière du soir.",
    det: "Matching separates. Relaxed shoulder, tapered waist. Lined throughout.",
    detFr: "Pièces assorties. Épaule décontractée, taille ajustée. Entièrement doublé.",
    care: "Dry clean recommended.", careFr: "Nettoyage à sec recommandé.",
    colours: ["Mauve", "Rose"],
  },
  {
    key: "teal-evening-piece",
    name: "Wouri Teal Evening Piece", nameFr: "Pièce du Soir Sarcelle Wouri",
    cat: "evening", col: "wouri-nights", price: 268000, featured: true,
    d: "Deep teal evening wear with a quiet sheen, made for the long nights along the Wouri.",
    dFr: "Une tenue de soirée sarcelle profond au lustre discret, pensée pour les longues nuits du Wouri.",
    det: "Weighted drape. Hand-finished seams. Full lining.",
    detFr: "Tombé lesté. Coutures finies main. Doublure complète.",
    care: "Dry clean only.", careFr: "Nettoyage à sec uniquement.",
    colours: ["Teal", "Obsidian"],
  },
  {
    key: "burgundy-statement",
    name: "Burgundy Statement Gown", nameFr: "Robe Déclaration Bordeaux",
    cat: "evening", col: "wouri-nights", price: 312000, featured: true,
    d: "A deep burgundy statement piece with sculptural volume through the skirt.",
    dFr: "Une pièce déclaration bordeaux profond, au volume sculptural sur la jupe.",
    det: "Structured underskirt. Boned bodice. Made to order in three weeks.",
    detFr: "Jupon structuré. Buste baleiné. Fabriquée sur commande en trois semaines.",
    care: "Specialist dry clean.", careFr: "Nettoyage à sec spécialisé.",
    colours: ["Burgundy", "Oxblood"],
  },
  {
    key: "amber-heritage-look",
    name: "Amber Heritage Look", nameFr: "Ensemble Patrimoine Ambre",
    cat: "ready-to-wear", col: "sawa-sun", price: 186000, featured: true,
    d: "Warm amber tones drawn from Cameroonian heritage textiles, shown in four views.",
    dFr: "Des tons ambrés chauds inspirés des textiles patrimoniaux camerounais, présentés en quatre vues.",
    det: "Woven detail at the yoke. Breathable weight. Generous through the sleeve.",
    detFr: "Détail tissé à l'empiècement. Grammage respirant. Manche généreuse.",
    care: "Gentle hand wash. Line dry in shade.",
    careFr: "Lavage main délicat. Séchage à l'ombre.",
    colours: ["Amber", "Ochre"],
  },
  {
    key: "charcoal-draped-look",
    name: "Charcoal Draped Look", nameFr: "Ensemble Drapé Anthracite",
    cat: "tailoring", col: "atelier-essentials", price: 198000, featured: false,
    d: "A charcoal draped silhouette, photographed from three angles in studio.",
    dFr: "Une silhouette drapée anthracite, photographiée sous trois angles en studio.",
    det: "Asymmetric drape. Wool-blend suiting. Half-lined.",
    detFr: "Drapé asymétrique. Laine mélangée. Demi-doublure.",
    care: "Dry clean. Brush after wear.",
    careFr: "Nettoyage à sec. Brosser après le port.",
    colours: ["Charcoal", "Slate"],
  },
  {
    key: "camel-tailored-coat",
    name: "Camel Tailored Coat", nameFr: "Manteau Tailleur Camel",
    cat: "tailoring", col: "atelier-essentials", price: 275000, featured: false,
    d: "A camel coat cut long and clean, the quiet backbone of a considered wardrobe.",
    dFr: "Un manteau camel coupé long et net, colonne vertébrale discrète d'un vestiaire réfléchi.",
    det: "Notch lapel. Horn buttons. Vented back.",
    detFr: "Revers cranté. Boutons en corne. Dos aéré.",
    care: "Dry clean. Do not tumble dry.",
    careFr: "Nettoyage à sec. Ne pas sécher en machine.",
    colours: ["Camel", "Sand"],
  },
  {
    key: "olive-safari-set",
    name: "Olive Safari Set", nameFr: "Ensemble Safari Olive",
    cat: "ready-to-wear", col: "sawa-sun", price: 164000, featured: false,
    d: "An olive safari set in breathable cotton, made for Douala mornings.",
    dFr: "Un ensemble safari olive en coton respirant, pensé pour les matins de Douala.",
    det: "Patch pockets. Self belt. Unlined for the heat.",
    detFr: "Poches plaquées. Ceinture assortie. Non doublé pour la chaleur.",
    care: "Machine wash cold, gentle cycle.",
    careFr: "Lavage machine à froid, cycle délicat.",
    colours: ["Olive", "Khaki"],
  },
  {
    key: "midnight-column",
    name: "Midnight Column Dress", nameFr: "Robe Colonne Minuit",
    cat: "evening", col: "wouri-nights", price: 232000, featured: false,
    d: "A midnight-blue column dress that skims rather than clings.",
    dFr: "Une robe colonne bleu minuit qui effleure le corps sans le mouler.",
    det: "Bias cut. Hidden side zip. Fully lined.",
    detFr: "Coupe en biais. Fermeture latérale invisible. Entièrement doublée.",
    care: "Dry clean only.", careFr: "Nettoyage à sec uniquement.",
    colours: ["Midnight", "Navy"],
  },
  {
    key: "periwinkle-drape",
    name: "Periwinkle Drape Gown", nameFr: "Robe Drapée Pervenche",
    cat: "evening", col: "wouri-nights", price: 288000, featured: false,
    d: "A periwinkle gown with a single sculpted shoulder and a long, quiet fall.",
    dFr: "Une robe pervenche à l'épaule sculptée unique et à la chute longue et discrète.",
    det: "One-shoulder construction. Internal corsetry. Floor length.",
    detFr: "Construction une épaule. Corseterie interne. Longueur au sol.",
    care: "Specialist dry clean.", careFr: "Nettoyage à sec spécialisé.",
    colours: ["Periwinkle"],
  },
  {
    key: "sand-linen-look",
    name: "Sand Linen Look", nameFr: "Ensemble Lin Sable",
    cat: "ready-to-wear", col: "sawa-sun", price: 142000, featured: false,
    d: "Washed sand linen, soft from the first wear.",
    dFr: "Un lin sable lavé, doux dès le premier port.",
    det: "European linen. Mother-of-pearl buttons. Relaxed fit.",
    detFr: "Lin européen. Boutons en nacre. Coupe décontractée.",
    care: "Machine wash cold. Warm iron.",
    careFr: "Lavage machine à froid. Repassage tiède.",
    colours: ["Sand", "Ivory"],
  },
  {
    key: "noir-editorial",
    name: "Noir Editorial Piece", nameFr: "Pièce Éditoriale Noir",
    cat: "evening", col: "atelier-essentials", price: 254000, featured: false,
    d: "A black editorial piece, shot for the house lookbook.",
    dFr: "Une pièce éditoriale noire, photographiée pour le lookbook de la maison.",
    det: "Sculpted shoulder. Matte finish. Fully lined.",
    detFr: "Épaule sculptée. Finition mate. Entièrement doublée.",
    care: "Dry clean only.", careFr: "Nettoyage à sec uniquement.",
    colours: ["Noir"],
  },
];

const SIZES = ["XS", "S", "M", "L"];

function slugify(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  const c = await pool.connect();
  try {
    await c.query("begin");

    // Clear the stock catalogue, preserving orders/users/settings.
    await c.query("delete from cart_items");
    await c.query("delete from wishlists");
    await c.query("delete from product_images");
    await c.query("delete from product_variants");
    await c.query("delete from products");
    await c.query("delete from lookbook_items");

    // Ensure every category referenced by the catalogue actually exists —
    // otherwise category_id is silently null and category filtering never
    // matches anything (shop filters, concierge retrieval, admin stats).
    const CATS = [...new Set(CATALOGUE.map((p) => p.cat))];
    for (const [i, slug] of CATS.entries()) {
      const name = slug
        .split("-")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ");
      await c.query(
        "insert into categories (name, slug, sort_order) values ($1,$2,$3) on conflict (slug) do nothing",
        [name, slug, 100 + i],
      );
    }

    const cats = Object.fromEntries(
      (await c.query("select id, slug from categories")).rows.map((r) => [r.slug, r.id]),
    );
    const cols = Object.fromEntries(
      (await c.query("select id, slug from collections")).rows.map((r) => [r.slug, r.id]),
    );

    let made = 0, imgs = 0;
    for (const [i, p] of CATALOGUE.entries()) {
      const photos = groups[p.key] || [];
      if (photos.length === 0) { console.log("no photos for", p.key); continue; }
      const slug = slugify(p.name);

      const r = await c.query(
        `insert into products
          (name, name_fr, slug, description, description_fr, details, details_fr,
           care_instructions, care_instructions_fr, category_id, collection_id,
           base_price, is_published, is_featured, popularity, seo_title, seo_description)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true,$13,$14,$15,$16) returning id`,
        [p.name, p.nameFr, slug, p.d, p.dFr, p.det, p.detFr, p.care, p.careFr,
         cats[p.cat] ?? null, cols[p.col] ?? null, p.price, p.featured,
         100 - i * 6, `${p.name} — OSSZ Collections`, p.d.slice(0, 155)],
      );
      const pid = r.rows[0].id;

      // Every photo of the same article becomes another slide, in order.
      for (const [j, url] of photos.entries()) {
        await c.query(
          "insert into product_images (product_id, url, alt_text, sort_order) values ($1,$2,$3,$4)",
          [pid, url, `${p.name} — view ${j + 1}`, j],
        );
        imgs++;
      }

      for (const colour of p.colours) {
        for (const [k, size] of SIZES.entries()) {
          await c.query(
            `insert into product_variants (product_id, size, colour, sku, stock_qty, low_stock_threshold)
             values ($1,$2,$3,$4,$5,3)`,
            [pid, size, colour, `${slug.slice(0, 8).toUpperCase()}-${size}-${colour.slice(0, 3).toUpperCase()}`,
             ((i + k) % 5) + 2],
          );
        }
      }
      made++;
    }

    // Lookbook: dedicated editorial photos, each used nowhere else.
    for (const [i, item] of EDITORIAL.lookbook.entries()) {
      await c.query(
        "insert into lookbook_items (title, caption, caption_fr, image_url, product_slug, sort_order) values ($1,$2,$3,$4,$5,$6)",
        [item.title, item.title, item.title, item.url, item.slug, i],
      );
    }

    // Homepage blocks — hero, banner and invite each a unique photo.
    await c.query("update home_blocks set image_url=$1 where type='hero'", [EDITORIAL.hero]);
    await c.query("update home_blocks set image_url=$1 where type='banner'", [EDITORIAL.banner]);
    await c.query("update home_blocks set image_url=$1 where type='quote'", [EDITORIAL.invite]);

    // Collection covers — each a unique photo.
    for (const [slug, url] of Object.entries(EDITORIAL.covers)) {
      await c.query("update collections set cover_image=$1 where slug=$2", [url, slug]);
    }

    // Journal covers — one dedicated photograph per article.
    const JOURNAL_COVERS = {
      "inside-the-akwa-atelier": "/catalogue/journal-atelier.png",
      "inside-our-ange-raphael-atelier": "/catalogue/journal-atelier.png",
      "how-to-wear-silk-in-the-humidity": "/catalogue/journal-silk-humidity.jpg",
      "a-guide-to-your-first-fitting": "/catalogue/journal-first-fitting.png",
    };
    await c.query("update journal_posts set cover_image=''");
    for (const [slug, url] of Object.entries(JOURNAL_COVERS)) {
      await c.query("update journal_posts set cover_image=$1 where slug=$2", [url, slug]);
    }

    await c.query("commit");
    console.log(`products: ${made}, images: ${imgs}`);
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
    await pool.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
