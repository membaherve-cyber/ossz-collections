import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: /@(localhost|127\.0\.0\.1|::1)/.test(connectionString) ? false : { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query("begin");

    // 1. Clear existing collections (and disconnect products)
    await client.query("UPDATE products SET collection_id = NULL WHERE collection_id IS NOT NULL");
    await client.query("DELETE FROM collections");
    console.log("Cleared existing collections");

    // 2. Insert new collections
    const collections = [
      { name: "Check Moves", slug: "check-moves", season: "", description: "" },
      { name: "Freeme", slug: "freeme", season: "2021", description: "" },
      { name: "95 VIVS Element", slug: "95-vivs-element", season: "", description: "" },
      { name: "Cultural Canvas", slug: "cultural-canvas", season: "", description: "" },
      { name: "Cultural Heritage", slug: "cultural-heritage", season: "", description: "" },
    ];

    for (const col of collections) {
      await client.query(
        `INSERT INTO collections (name, slug, season, description, is_published, is_featured)
         VALUES ($1, $2, $3, $4, true, false)`,
        [col.name, col.slug, col.season, col.description]
      );
    }
    console.log(`Inserted ${collections.length} collections`);

    // 3. Clear existing categories (and disconnect products)
    await client.query("UPDATE products SET category_id = NULL WHERE category_id IS NOT NULL");
    await client.query("DELETE FROM categories");
    console.log("Cleared existing categories");

    // 4. Insert new categories with subcategories
    const categories = [
      { name: "Ready to Wear", slug: "ready-to-wear", parent: null },
      { name: "Kaftans", slug: "kaftans", parent: null },
      { name: "Agbada", slug: "agbada", parent: null },
      { name: "Pants", slug: "pants", parent: null },
      { name: "Shirts", slug: "shirts", parent: null },
      { name: "Danshiki", slug: "danshiki", parent: null },
      { name: "Oversize", slug: "oversize", parent: null },
      { name: "Hats", slug: "hats", parent: null },
      { name: "Shoes", slug: "shoes", parent: null },
      { name: "Sandals", slug: "sandals", parent: null },
      { name: "Cufflinks", slug: "cufflinks", parent: null },
      { name: "Bags", slug: "bags", parent: null },
      { name: "Tie / Cravate", slug: "tie-cravate", parent: null },
      { name: "Bold Tie", slug: "bold-tie", parent: null },
    ];

    // Subcategories (will reference parent IDs)
    const subcategories = [
      { name: "Classic Shirts", slug: "classic-shirts", parentSlug: "shirts" },
      { name: "Vintage Shirts", slug: "vintage-shirts", parentSlug: "shirts" },
      { name: "Classic Pants", slug: "classic-pants", parentSlug: "pants" },
      { name: "Gurkha Pants", slug: "gurkha-pants", parentSlug: "pants" },
      { name: "Palazzo Pants", slug: "palazzo-pants", parentSlug: "pants" },
    ];

    const catIds = {};
    let sortOrder = 0;
    for (const cat of categories) {
      const res = await client.query(
        `INSERT INTO categories (name, slug, parent_id, sort_order)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [cat.name, cat.slug, cat.parent, sortOrder++]
      );
      catIds[cat.slug] = res.rows[0].id;
    }

    for (const sub of subcategories) {
      const parentId = catIds[sub.parentSlug];
      if (parentId) {
        await client.query(
          `INSERT INTO categories (name, slug, parent_id, sort_order)
           VALUES ($1, $2, $3, $4)`,
          [sub.name, sub.slug, parentId, sortOrder++]
        );
      }
    }
    console.log(`Inserted ${categories.length} categories + ${subcategories.length} subcategories`);

    await client.query("commit");
    console.log("✓ Catalogue update complete");
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
