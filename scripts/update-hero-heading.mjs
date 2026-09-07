import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const before = await client.query(
      `SELECT id, type, heading, heading_fr FROM home_blocks WHERE type = 'hero'`
    );
    console.log("Before:", before.rows[0] ?? "none");

    await client.query(
      `UPDATE home_blocks SET heading = $1, heading_fr = $2 WHERE type = 'hero'`,
      ["Bring Out The Class in You", "Révélez la classe en vous"]
    );

    const after = await client.query(
      `SELECT id, type, heading, heading_fr, body, body_fr, cta_label, cta_href FROM home_blocks WHERE type = 'hero'`
    );
    console.log("After:", after.rows[0]);
  } finally {
    client.release();
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});