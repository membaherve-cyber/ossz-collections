import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    // Fix hero block body_fr - replace Akwa with Douala
    await client.query(
      `UPDATE home_blocks SET body_fr = replace(body_fr, $1, $2) WHERE type = 'hero'`,
      ["atelier d'Akwa", "atelier de Douala"]
    );
    console.log("✅ Fixed hero block FR body");

    // Verify all blocks
    const res = await client.query("SELECT id, type, body, body_fr FROM home_blocks ORDER BY sort_order");
    for (const row of res.rows) {
      console.log(`\nBlock ${row.id} (${row.type}):`);
      console.log(`  EN: ${row.body?.substring(0, 120)}`);
      console.log(`  FR: ${row.body_fr?.substring(0, 120)}`);
      
      // Check for remaining Akwa/Liberté
      const allText = `${row.body || ""} ${row.body_fr || ""} ${row.heading || ""} ${row.heading_fr || ""}`;
      if (allText.includes("Akwa") || allText.includes("Libert")) {
        console.log("  ⚠️ STILL HAS REFERENCE!");
      }
    }
  } finally {
    client.release();
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
