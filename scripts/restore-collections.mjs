import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  // 1. Update collections with full data
  const collectionData = [
    {
      slug: "check-moves",
      name: "Check Moves",
      nameFr: "Check Moves",
      description: "Geometric precision meets bold pattern — the Check Moves collection reimagines the classic check through the lens of contemporary African tailoring.",
      descriptionFr: "Précision géométrique et motifs audacieux — la collection Check Moves réinvente le carreau classique à travers le prisme de la couture africaine contemporaine.",
      season: "2023",
      seasonFr: "2023",
      coverImage: "/catalogue/ossz-sky-blue-suit-1.jpg",
    },
    {
      slug: "freeme",
      name: "Freeme",
      nameFr: "Freeme",
      description: "Freedom expressed in fabric — loose silhouettes, saturated colour, and hand-finished details that celebrate the joy of dressing without constraint.",
      descriptionFr: "La liberté exprimée en tissu — silhouettes fluides, couleurs saturées et finitions artisanales qui célèbrent le plaisir de s'habiller sans contrainte.",
      season: "2021",
      seasonFr: "2021",
      coverImage: "/catalogue/ossz-velvet-embroidered-1.png",
    },
    {
      slug: "95-vivs-element",
      name: "95 VIVS Element",
      nameFr: "95 VIVS Element",
      description: "A tribute to the raw energy of Douala's streets circa 1995 — structured shoulders, wide trousers, and the unapologetic confidence of the early OSSZ era.",
      descriptionFr: "Un hommage à l'énergie brute des rues de Douala vers 1995 — épaules structurées, pantalons larges et l'assurance sans concession de la première ère OSSZ.",
      season: "2022",
      seasonFr: "2022",
      coverImage: "/catalogue/ossz-indigo-agbada-1.jpg",
    },
    {
      slug: "cultural-canvas",
      name: "Cultural Canvas",
      nameFr: "Toile Culturelle",
      description: "Every garment is a canvas — hand-dyed indigo, artisanal embroidery, and ceremonial silhouettes that honour Cameroonian textile traditions.",
      descriptionFr: "Chaque vêtement est une toile — indigo teint à la main, broderies artisanales et silhouettes cérémonielles qui honorent les traditions textiles camerounaises.",
      season: "2024",
      seasonFr: "2024",
      coverImage: "/catalogue/ossz-royal-blue-agbada-1.jpg",
    },
    {
      slug: "cultural-heritage",
      name: "Cultural Heritage",
      nameFr: "Patrimoine Culturel",
      description: "The pieces that outlast seasons — timeless agbada, ceremonial boubou, and investment tailoring crafted to be passed down through generations.",
      descriptionFr: "Les pièces qui survivent aux saisons — agbada intemporel, boubou cérémoniel et tailleur d'investissement conçu pour se transmettre de génération en génération.",
      season: "2024",
      seasonFr: "2024",
      coverImage: "/catalogue/ossz-indigo-agbada-2.jpg",
    },
  ];

  for (const col of collectionData) {
    await sql`
      UPDATE collections
      SET
        name = ${col.name},
        name_fr = ${col.nameFr},
        description = ${col.description},
        description_fr = ${col.descriptionFr},
        season = ${col.season},
        season_fr = ${col.seasonFr},
        cover_image = ${col.coverImage}
      WHERE slug = ${col.slug}
    `;
    console.log(`✅ Updated collection: ${col.name}`);
  }

  // 2. Link products to collections
  const productLinks = [
    // Check Moves — geometric pattern, checks, suiting
    { slug: "camel-tailored-coat", collectionSlug: "check-moves" },
    { slug: "charcoal-draped-look", collectionSlug: "check-moves" },

    // Freeme — loose silhouettes, freedom
    { slug: "periwinkle-drape-gown", collectionSlug: "freeme" },
    { slug: "mauve-signature-set", collectionSlug: "freeme" },
    { slug: "sand-linen-look", collectionSlug: "freeme" },

    // 95 VIVS Element — structured, wide, bold
    { slug: "ivoire-occasion-gown", collectionSlug: "95-vivs-element" },
    { slug: "burgundy-statement-gown", collectionSlug: "95-vivs-element" },

    // Cultural Canvas — indigo, artisanal, ceremonial
    { slug: "amber-heritage-look", collectionSlug: "cultural-canvas" },
    { slug: "olive-safari-set", collectionSlug: "cultural-canvas" },
    { slug: "wouri-teal-evening-piece", collectionSlug: "cultural-canvas" },

    // Cultural Heritage — timeless, investment pieces
    { slug: "midnight-column-dress", collectionSlug: "cultural-heritage" },
    { slug: "noir-editorial-piece", collectionSlug: "cultural-heritage" },
  ];

  for (const link of productLinks) {
    // Get collection ID
    const colRows = await sql`SELECT id FROM collections WHERE slug = ${link.collectionSlug}`;
    if (colRows.length === 0) {
      console.log(`⚠️  Collection not found: ${link.collectionSlug}`);
      continue;
    }
    const collectionId = colRows[0].id;

    // Update product
    await sql`UPDATE products SET collection_id = ${collectionId} WHERE slug = ${link.slug}`;
    console.log(`✅ Linked ${link.slug} → ${link.collectionSlug}`);
  }

  console.log("\n🎉 All collections restored!");
}

main().catch(console.error);
