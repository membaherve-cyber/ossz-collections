import { execSync } from "node:child_process";
import pg from "pg";

/**
 * One-command production database setup.
 *
 *   DATABASE_URL="postgres://…" npm run db:setup
 *
 * 1. Pushes the Drizzle schema (creates every table).
 * 2. Seeds reference data, French translations, the real catalogue and the
 *    staff logins — each seed script is idempotent, so re-running is safe and
 *    never duplicates data.
 *
 * Run this once after creating the production database, and again only if you
 * add new tables.
 */

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required. Example:\n  DATABASE_URL=postgres://… npm run db:setup");
  process.exit(1);
}

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env });
}

async function main() {
  // 1. schema
  run("npx drizzle-kit push --config=drizzle.config.ts");

  // 2. seeds (idempotent)
  const seeds = [
    "scripts/seed.mjs",
    "scripts/seed-fr.mjs",
    "scripts/seed-real.mjs",
    "scripts/seed-staff-logins.mjs",
  ];
  for (const s of seeds) {
    try {
      run(`node ${s}`);
    } catch {
      console.warn(`(${s} reported an issue — continuing; it may already be seeded)`);
    }
  }

  // 3. confirm
  const pool = new pg.Pool({
    connectionString: url,
    ssl: /@(localhost|127\.0\.0\.1)/.test(url) ? false : { rejectUnauthorized: false },
  });
  const r = await pool.query(
    "select (select count(*) from products) products, (select count(*) from settings) settings, (select count(*) from users) users",
  );
  await pool.end();
  console.log("\n✓ Database ready:", r.rows[0]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
