import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    // Get the current max sort order
    const maxResult = await client.query("SELECT COALESCE(MAX(sort_order), 0) as max_order FROM lookbook_items");
    let sortOrder = maxResult.rows[0].max_order + 1;

    const items = [
      {
        title: "Black Velvet Embroidered Jacket",
        caption: "Hand-embroidered velvet jacket with traditional Cameroonian motifs. Statement piece for evening occasions.",
        caption_fr: "Veste en velours brodée à la main avec motifs traditionnels camerounais. Pièce statement pour les occasions du soir.",
        image_url: "/catalogue/ossz-velvet-embroidered-1.png",
        product_slug: "",
      },
      {
        title: "Velvet Embroidered Full Look",
        caption: "Complete velvet ensemble with matching embroidered trousers and artisanal shoes. Head-to-toe elegance.",
        caption_fr: "Ensemble velours complet avec pantalon brodé assorti et chaussures artisanales. Élégance de la tête aux pieds.",
        image_url: "/catalogue/ossz-velvet-embroidered-2.png",
        product_slug: "",
      },
      {
        title: "Indigo Adire Agbada",
        caption: "Royal blue agbada with hand-dyed indigo adire vest and carved staff. Heritage meets contemporary craft.",
        caption_fr: "Agbada bleu royal avec gilet indigo adire teint à la main et bâton sculpté. Patrimoine rencontre artisanat contemporain.",
        image_url: "/catalogue/ossz-indigo-agbada-1.jpg",
        product_slug: "",
      },
      {
        title: "Indigo Adire Ceremonial Set",
        caption: "The complete ceremonial look — agbada, adire vest, beaded necklaces, and leather staff. Made for moments that matter.",
        caption_fr: "Le look cérémonial complet — agbada, gilet adire, colliers de perles et bâton en cuir. Fait pour les moments qui comptent.",
        image_url: "/catalogue/ossz-indigo-agbada-2.jpg",
        product_slug: "",
      },
      {
        title: "Sky Blue Tailored Suit",
        caption: "Precision-cut sky blue suit with polka dot tie. Studio elegance for the modern gentleman.",
        caption_fr: "Costume bleu ciel taillé avec précision et cravate à pois. Élégance studio pour l'homme moderne.",
        image_url: "/catalogue/ossz-sky-blue-suit-1.jpg",
        product_slug: "",
      },
      {
        title: "Sky Blue Suit — Detail",
        caption: "Every seam, every stitch — the detail that separates bespoke from off-the-rack.",
        caption_fr: "Chaque couture, chaque point — le détail qui sépare le sur-mesure du prêt-à-porter.",
        image_url: "/catalogue/ossz-sky-blue-suit-2.jpg",
        product_slug: "",
      },
      {
        title: "Indigo Adire — Portrait",
        caption: "Adire indigo close-up. The texture of hand-dyed fabric tells a story no machine can replicate.",
        caption_fr: "Gros plan sur l'adire indigo. La texture du tissu teint à la main raconte une qu'aucune machine ne peut reproduire.",
        image_url: "/catalogue/ossz-indigo-agbada-3.jpg",
        product_slug: "",
      },
      {
        title: "Indigo Heritage",
        caption: "Profile view of the indigo adire ensemble. Tradition woven into every thread.",
        caption_fr: "Vue de profil de l'ensemble adire indigo. La tradition tissée dans chaque fil.",
        image_url: "/catalogue/ossz-indigo-agbada-4.jpg",
        product_slug: "",
      },
      {
        title: "Royal Blue Agbada Close-Up",
        caption: "Velvet cap, beaded necklace, carved staff — the accessories that complete the vision.",
        caption_fr: "Bonnet en velours, collier de perles, bâton sculpté — les accessoires qui complètent la vision.",
        image_url: "/catalogue/ossz-royal-blue-agbada-1.jpg",
        product_slug: "",
      },
    ];

    for (const item of items) {
      await client.query(
        `INSERT INTO lookbook_items (title, caption, caption_fr, image_url, product_slug, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [item.title, item.caption, item.caption_fr, item.image_url, item.product_slug, sortOrder++]
      );
    }

    console.log(`✅ Added ${items.length} new lookbook items (sort ${sortOrder - items.length} to ${sortOrder - 1})`);

    // Verify no duplicates
    const allLookbook = await client.query("SELECT image_url, COUNT(*) as cnt FROM lookbook_items GROUP BY image_url HAVING COUNT(*) > 1");
    if (allLookbook.rows.length > 0) {
      console.log("⚠️ Duplicate images found:", allLookbook.rows);
    } else {
      console.log("✅ No duplicate images in lookbook");
    }

    const total = await client.query("SELECT COUNT(*) as total FROM lookbook_items");
    console.log(`Total lookbook items: ${total.rows[0].total}`);
  } finally {
    client.release();
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
