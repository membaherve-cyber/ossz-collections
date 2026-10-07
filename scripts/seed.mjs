import { randomBytes, scryptSync } from "node:crypto";
import pg from "pg";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db";
const pool = new pg.Pool({
  connectionString,
  ssl: /@(localhost|127\.0\.0\.1)/.test(connectionString) ? false : { rejectUnauthorized: false },
});

function hash(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

const P = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=1000`;
const L = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600`;

const PORTRAITS = [10317493, 19317140, 952214, 9463361, 30050895, 38284796, 16089258, 19325992, 7760991, 38201621];
const SCENES = [35045845, 35045844, 8386643, 8311882, 34817404, 13068364, 7031842, 9328756];

const categories = [
  ["Ready-to-wear", "ready-to-wear"],
  ["Evening", "evening"],
  ["Tailoring", "tailoring"],
  ["Knitwear", "knitwear"],
  ["Accessories", "accessories"],
];

const collections = [
  {
    name: "Wouri Nights",
    slug: "wouri-nights",
    description:
      "Evening pieces cut for the long, warm nights along the Wouri — fluid silks, hand-finished seams and a restrained shimmer.",
    cover: L(SCENES[0]),
    season: "Season 04",
    featured: true,
  },
  {
    name: "Atelier Essentials",
    slug: "atelier-essentials",
    description:
      "The quiet backbone of the OSSZ wardrobe: precise tailoring, honest cottons and pieces built to be worn for a decade.",
    cover: L(SCENES[2]),
    season: "Permanent",
    featured: true,
  },
  {
    name: "Sawa Sun",
    slug: "sawa-sun",
    description:
      "Light, breathable daywear inspired by Douala mornings — loose linen, raffia detail and colours drawn from the coast.",
    cover: L(SCENES[4]),
    season: "Season 03",
    featured: false,
  },
];

const products = [
  ["Mbanga Silk Gown", "evening", "wouri-nights", 285000, "A floor-sweeping silk gown with a softly draped cowl and hand-rolled hem.", "100% mulberry silk. Bias cut. Hidden side zip. Fully lined.", "Dry clean only. Store on a padded hanger.", [0, 1], true, 42],
  ["Akwa Tailored Blazer", "tailoring", "atelier-essentials", 165000, "A single-breasted blazer with a sharp shoulder and a gently suppressed waist.", "Wool-blend suiting woven in Italy. Horn buttons. Half-canvassed construction.", "Dry clean. Brush after wear.", [3, 9], true, 65],
  ["Wouri Wrap Dress", "ready-to-wear", "wouri-nights", 132000, "A wrap dress in fluid crepe, finished with a self-tie sash.", "Viscose crepe. Adjustable wrap closure. Midi length.", "Cold hand wash. Line dry in shade.", [5, 7], true, 88],
  ["Bonapriso Linen Shirt", "ready-to-wear", "sawa-sun", 68000, "An easy, oversized linen shirt with a soft collar and dropped shoulder.", "Washed European linen. Mother-of-pearl buttons.", "Machine wash cold. Warm iron.", [8, 6], false, 120],
  ["Sanaga Wide Trouser", "tailoring", "atelier-essentials", 94000, "A high-waisted wide-leg trouser with a pressed crease and deep pockets.", "Tencel-wool blend. Hook-and-bar closure. Unlined.", "Dry clean recommended.", [2, 4], true, 71],
  ["Douala Knit Column", "knitwear", "atelier-essentials", 112000, "A fine-gauge knitted column dress that skims rather than clings.", "Merino and cotton blend. Ribbed neckline and cuffs.", "Hand wash cold. Dry flat.", [6, 5], false, 54],
  ["Limbe Raffia Tote", "accessories", "sawa-sun", 58000, "A hand-woven raffia tote with leather handles, made with artisans in Limbe.", "Natural raffia. Vegetable-tanned leather. Cotton lining.", "Keep dry. Spot clean only.", [7, 8], false, 96],
  ["Kribi Beaded Slip", "evening", "wouri-nights", 218000, "A bias-cut slip dress with hand-beaded straps and a whisper of weight.", "Silk satin with glass beadwork. 48 hours of hand finishing.", "Dry clean only, specialist beading.", [1, 0], true, 37],
  ["Bali Cotton Boubou", "ready-to-wear", "sawa-sun", 87000, "A relaxed boubou in crisp cotton poplin with tonal embroidery at the yoke.", "Organic cotton poplin. Hand embroidery. Side slits.", "Machine wash cold, gentle cycle.", [4, 3], false, 63],
  ["Bonanjo Trench", "tailoring", "atelier-essentials", 245000, "A lightweight trench cut for the rainy season, with a storm flap and belt.", "Water-resistant cotton gabardine. Removable belt. Vented back.", "Dry clean. Do not tumble dry.", [9, 2], true, 29],
  ["Njoya Silk Scarf", "accessories", "wouri-nights", 42000, "A square silk scarf printed with a motif drawn from Bamoun architecture.", "Silk twill. Hand-rolled edges. 90 × 90 cm.", "Dry clean or gentle hand wash.", [0, 6], false, 140],
  ["Deido Ribbed Knit", "knitwear", "atelier-essentials", 76000, "A close-fitting ribbed knit top with a high neck and long sleeves.", "Merino rib. Fitted silhouette. Sits at the hip.", "Hand wash cold. Reshape while damp.", [8, 1], false, 82],
];

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLOUR_SETS = [
  ["Obsidian", "Ivory"],
  ["Terracotta", "Charcoal"],
  ["Palm", "Sand"],
];

async function main() {
  const client = await pool.connect();
  try {
    await client.query("begin");

    const counts = await client.query("select count(*)::int as n from products");
    if (counts.rows[0].n > 0) {
      console.log("Seed skipped — catalogue already present.");
      await client.query("rollback");
      return;
    }

    // Users
    const people = [
      ["owner@osszcollections.cm", "Amina Ossz", "admin", "+237650000001"],
      ["staff@osszcollections.cm", "Eric Njoya", "staff", "+237650000002"],
      ["studio@osszcollections.cm", "Clarisse Mbah", "uploader", "+237650000003"],
      ["client@example.com", "Sandrine Kouam", "customer", "+237650000004"],
    ];
    const userIds = {};
    for (const [email, name, role, phone] of people) {
      const res = await client.query(
        `insert into users (email, full_name, role, phone, password_hash)
         values ($1,$2,$3,$4,$5) on conflict (email) do update set full_name = excluded.full_name
         returning id`,
        [email, name, role, phone, hash("ossz2026")],
      );
      userIds[role] = res.rows[0].id;
    }

    // Categories
    const catIds = {};
    let order = 0;
    for (const [name, slug] of categories) {
      const res = await client.query(
        "insert into categories (name, slug, sort_order) values ($1,$2,$3) returning id",
        [name, slug, order++],
      );
      catIds[slug] = res.rows[0].id;
    }

    // Collections
    const colIds = {};
    for (const c of collections) {
      const res = await client.query(
        `insert into collections (name, slug, description, cover_image, season, is_featured)
         values ($1,$2,$3,$4,$5,$6) returning id`,
        [c.name, c.slug, c.description, c.cover, c.season, c.featured],
      );
      colIds[c.slug] = res.rows[0].id;
    }

    // Products
    let index = 0;
    for (const [name, cat, col, price, description, details, care, imgs, featured, popularity] of products) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const res = await client.query(
        `insert into products (name, slug, description, details, care_instructions, category_id, collection_id,
           base_price, is_published, is_featured, popularity, seo_title, seo_description)
         values ($1,$2,$3,$4,$5,$6,$7,$8,true,$9,$10,$11,$12) returning id`,
        [
          name,
          slug,
          description,
          details,
          care,
          catIds[cat],
          colIds[col],
          price,
          featured,
          popularity,
          `${name} — OSSZ Collections`,
          description.slice(0, 155),
        ],
      );
      const productId = res.rows[0].id;

      for (const [i, imgIdx] of imgs.entries()) {
        await client.query(
          "insert into product_images (product_id, url, alt_text, sort_order) values ($1,$2,$3,$4)",
          [productId, P(PORTRAITS[imgIdx]), `${name} photographed for OSSZ Collections`, i],
        );
      }

      const colours = COLOUR_SETS[index % COLOUR_SETS.length];
      const sizes = cat === "accessories" ? ["One size"] : SIZES.slice(0, 4);
      let v = 0;
      for (const colour of colours) {
        for (const size of sizes) {
          const stock = (index + v) % 7 === 0 ? 0 : ((index * 3 + v * 2) % 9) + 1;
          await client.query(
            `insert into product_variants (product_id, size, colour, sku, stock_qty, low_stock_threshold)
             values ($1,$2,$3,$4,$5,3)`,
            [productId, size, colour, `${slug.slice(0, 8).toUpperCase()}-${size}-${colour.slice(0, 3).toUpperCase()}`, stock],
          );
          v += 1;
        }
      }
      index += 1;
    }

    // Media library
    for (const [i, id] of [...PORTRAITS, ...SCENES].entries()) {
      await client.query(
        "insert into media (url, alt_text, tags, uploaded_by) values ($1,$2,$3,$4)",
        [i < PORTRAITS.length ? P(id) : L(id), "OSSZ editorial imagery", i < PORTRAITS.length ? "product,editorial" : "interior,campaign", userIds.uploader],
      );
    }

    // Home blocks
    const blocks = [
      ["hero", "", "Bring Out The Class in You", "Hand-finished silks and quiet tailoring, made in our Ange Raphael atelier and delivered across Cameroon.", L(SCENES[0]), "Discover our collections", "/collections", 0],
      ["banner", "Atelier Essentials", "The pieces you will keep for a decade", "Precise tailoring in honest fabric — the quiet backbone of the OSSZ wardrobe.", L(SCENES[2]), "Shop essentials", "/collections/atelier-essentials", 1],
      ["quote", "Our promise", "Fitted in person, wherever you are", "Book a private styling appointment in Akwa, or let our concierge guide you online.", L(SCENES[4]), "Book an appointment", "/appointments", 2],
    ];
    for (const b of blocks) {
      await client.query(
        `insert into home_blocks (type, eyebrow, heading, body, image_url, cta_label, cta_href, sort_order)
         values ($1,$2,$3,$4,$5,$6,$7,$8)`,
        b,
      );
    }

    // Lookbook
    const looks = [
      ["Look 01", "The Mbanga gown, worn bare-shouldered at dusk.", P(PORTRAITS[0]), "mbanga-silk-gown"],
      ["Look 02", "Akwa blazer over the Deido rib, Sanaga trouser beneath.", P(PORTRAITS[3]), "akwa-tailored-blazer"],
      ["Look 03", "Bonapriso linen, unbuttoned for the harbour breeze.", P(PORTRAITS[8]), "bonapriso-linen-shirt"],
      ["Look 04", "Kribi beading catching the last of the light.", P(PORTRAITS[1]), "kribi-beaded-slip"],
      ["Look 05", "The Bonanjo trench, cut for the rains.", P(PORTRAITS[9]), "bonanjo-trench"],
      ["Look 06", "Sawa Sun, styled with the Limbe raffia tote.", P(PORTRAITS[6]), "limbe-raffia-tote"],
    ];
    for (const [i, [title, caption, url, slug]] of looks.entries()) {
      await client.query(
        "insert into lookbook_items (title, caption, image_url, product_slug, sort_order) values ($1,$2,$3,$4,$5)",
        [title, caption, url, slug, i],
      );
    }

    // Journal
    const posts = [
      ["Inside our Ange Raphael atelier", "inside-the-akwa-atelier", "Four tailors, one long table, and the patience that a hand-rolled hem demands.", "Our atelier is at Ange Raphael in Douala.\n\nEvery OSSZ piece begins on a long shared table where four tailors work in a rhythm they set themselves. A silk hem is rolled by hand — roughly forty minutes of work that most people will never notice, and that everyone feels when the dress moves.\n\nWe keep production small on purpose. A style is cut in a run of twenty, sometimes thirty, and when it is finished it is finished.", "/catalogue/journal-atelier.png"],
      ["How to wear silk in the humidity", "how-to-wear-silk-in-the-humidity", "Douala is warm and wet for much of the year. Silk still belongs here — with a little care.", "The trick is weight and cut, not avoidance.\n\nChoose a bias cut that falls away from the body rather than clinging to it. Keep beading for the evening, when the air cools. And air a silk piece overnight before returning it to the wardrobe — never fold it damp.\n\nOur concierge can advise on fabric weight for any piece; simply ask.", "/catalogue/journal-silk-humidity.jpg"],
      ["A guide to your first fitting", "a-guide-to-your-first-fitting", "What to bring, what to expect, and why we take forty minutes rather than ten.", "A first fitting at OSSZ takes about forty minutes.\n\nBring the shoes you intend to wear, and, if you can, a photograph of the occasion or setting. We will take eight measurements, discuss ease and movement, and agree a delivery date before you leave.\n\nAlterations on OSSZ pieces are complimentary within thirty days of purchase.", "/catalogue/journal-first-fitting.png"],
    ];
    for (const [title, slug, excerpt, body, cover] of posts) {
      await client.query(
        `insert into journal_posts (title, slug, excerpt, body, cover_image, author_name, status, published_at)
         values ($1,$2,$3,$4,$5,'OSSZ Studio','published', now())`,
        [title, slug, excerpt, body, cover],
      );
    }

    // FAQs
    const faqs = [
      ["Delivery", "How long does delivery take in Douala?", "National shipping reaches Douala (and the rest of Cameroon) in two to four working days, with a flat fee shown at checkout. In-store pickup at our Ange Raphael boutique is free and ready within 24 hours.", 0],
      ["Delivery", "Do you ship across Cameroon?", "Yes. National shipping through our partner courier takes two to four working days, with a flat fee shown at checkout.", 1],
      ["Delivery", "Can I collect in store?", "Certainly. Choose in-store pickup at checkout and we will notify you the moment your order is ready at our Ange Raphael boutique — it is free.", 2],
      ["Payment", "Which payment methods do you accept?", "MTN Mobile Money, Orange Money, and Visa or Mastercard. Mobile money and card are treated equally at checkout.", 3],
      ["Payment", "Is paying on delivery possible?", "Cash or mobile money on delivery is available for in-store pickup orders. When it is switched on, you will see it as an option at checkout.", 4],
      ["Returns", "What is your returns policy?", "Unworn pieces may be returned within fourteen days with their tags attached, for exchange or store credit. Beaded and made-to-measure pieces are final sale.", 5],
      ["Returns", "Do you offer alterations?", "Yes — alterations on OSSZ pieces are complimentary within thirty days of purchase, by appointment at the boutique.", 6],
      ["Sizing", "How do your sizes run?", "Our ready-to-wear runs true to size with a generous ease through the shoulder. If you are between sizes, our concierge or a stylist will gladly advise.", 7],
      ["General", "Where is the boutique?", "Ange Raphael, Douala — Cameroon. We are open Monday to Friday 9:00–18:00, Saturday 9:00–13:00, and on Sunday by appointment.", 8],
    ];
    for (const [category, question, answer, sort] of faqs) {
      await client.query(
        "insert into faqs (category, question, answer, sort_order) values ($1,$2,$3,$4)",
        [category, question, answer, sort],
      );
    }

    // Delivery zones — two options only: national shipping + free in-store pickup at Ange Raphael.
    const zones = [
      ["National shipping — Cameroon", "national", 6500, "2–4 working days"],
      ["In-store pickup — Ange Raphael boutique", "pickup", 0, "Ready within 24 hours"],
    ];
    for (const [name, method, fee, eta] of zones) {
      await client.query(
        "insert into delivery_zones (name, method, fee, eta_label) values ($1,$2,$3,$4)",
        [name, method, fee, eta],
      );
    }

    // Coupons
    await client.query(
      `insert into coupons (code, type, value, usage_limit, is_active) values
        ('WELCOME10','percentage',10,0,true),
        ('OSSZFREE','free_delivery',0,0,true),
        ('SEASON04','fixed',15000,50,true)`,
    );

    // Settings
    const settings = [
      ["whatsapp_number", "+237650000000"],
      ["store_address", "Boulevard de la Liberté, Akwa — Douala, Cameroon"],
      ["business_hours", "Monday–Saturday, 9:00–19:00 · Sunday by appointment"],
      ["concierge_greeting", "Good day, and welcome to OSSZ Collections. I am the OSSZ Concierge — how may I assist you today?"],
      ["contact_email", "hello@osszcollections.cm"],
      ["cod_enabled", "false"],
      ["mobile_money_enabled", "true"],
      ["card_enabled", "true"],
      ["free_delivery_threshold", "150000"],
    ];
    for (const [key, value] of settings) {
      await client.query(
        "insert into settings (key, value) values ($1,$2) on conflict (key) do update set value = excluded.value",
        [key, value],
      );
    }

    // A couple of orders so the dashboard has life
    const variant = await client.query("select id from product_variants order by id limit 2");
    const orderSeed = [
      ["OSZ-DEMO01", "client@example.com", "+237650000004", "Sandrine Kouam", "delivered", 285000, 2000, "mobile_money_mtn"],
      ["OSZ-DEMO02", "guest@example.com", "+237650000009", "Marc Etoundi", "processing", 165000, 3000, "card"],
    ];
    for (const [number, email, phone, name, status, subtotal, fee, method] of orderSeed) {
      const res = await client.query(
        `insert into orders (order_number, guest_email, guest_phone, customer_name, status, subtotal,
           delivery_fee, total, payment_method, payment_status, delivery_method, delivery_zone, shipping_snapshot)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'paid','douala_local','Douala — Akwa, Bonanjo, Bonapriso',$10)
         returning id`,
        [number, email, phone, name, status, subtotal, fee, subtotal + fee, method,
          JSON.stringify({ fullName: name, phone, city: "Douala", area: "Akwa", street: "Rue Joss" })],
      );
      await client.query(
        `insert into order_items (order_id, variant_id, product_name, product_slug, variant_label, quantity, unit_price)
         values ($1,$2,$3,$4,$5,1,$6)`,
        [res.rows[0].id, variant.rows[0].id, "Mbanga Silk Gown", "mbanga-silk-gown", "M · Obsidian", subtotal],
      );
    }

    // Appointments
    const soon = new Date(Date.now() + 1000 * 60 * 60 * 26);
    soon.setMinutes(0, 0, 0);
    await client.query(
      `insert into appointments (reference, guest_name, guest_contact, service, slot_start, slot_end, status, notes)
       values ('APT-0001','Sandrine Kouam','+237650000004','Fitting', $1, $2, 'confirmed', 'Bringing shoes for the Mbanga gown')`,
      [soon, new Date(soon.getTime() + 3600000)],
    );

    await client.query("commit");
    console.log("Seed complete.");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
