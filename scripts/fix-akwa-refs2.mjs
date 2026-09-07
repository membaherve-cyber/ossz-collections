import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    // Fix quote block body_fr
    await client.query(
      `UPDATE home_blocks SET body_fr = replace(body_fr, $1, $2) WHERE type = 'quote'`,
      ["à Akwa", "à notre boutique Ange Raphael"]
    );
    console.log("✅ Fixed quote block FR body");

    // Verify
    const res = await client.query("SELECT id, type, body, body_fr FROM home_blocks WHERE type = 'quote'");
    console.log("Quote EN:", res.rows[0].body);
    console.log("Quote FR:", res.rows[0].body_fr);
  } finally {
    client.release();
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
