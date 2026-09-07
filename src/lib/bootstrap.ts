import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { Pool } from "pg";

const run = promisify(execFile);

/**
 * Zero-touch database setup.
 *
 * On first boot against an empty database this:
 *   1. creates every table from scripts/schema.sql (no drizzle-kit, no terminal)
 *   2. seeds reference data, translations, the catalogue and staff logins
 *
 * Designed for a non-technical deploy: push to GitHub, connect Vercel + a
 * database, and the site brings itself up populated with no commands to run.
 *
 * Safe by construction:
 *   • only acts when the catalogue is genuinely absent
 *   • seeds are idempotent, so nothing is ever duplicated
 *   • never blocks or crashes startup; every failure is logged and swallowed
 */
export async function bootstrap(): Promise<void> {
  let pool: Pool | undefined;
  try {
    const url = process.env.DATABASE_URL;
    if (!url) return;

    const ssl = /@(localhost|127\.0\.0\.1|::1)[:/]/.test(url)
      ? false
      : { rejectUnauthorized: false };
    pool = new Pool({ connectionString: url, ssl, max: 1, connectionTimeoutMillis: 8000 });

    // Do the tables exist yet?
    let tablesExist = false;
    let hasProducts = false;
    try {
      const res = await pool.query("select count(*)::int as n from products");
      tablesExist = true;
      hasProducts = res.rows[0].n > 0;
    } catch {
      tablesExist = false;
    }

    // 1. Create the schema if this is a brand-new database.
    if (!tablesExist) {
      console.log("[ossz] fresh database — creating tables");
      try {
        const sql = await readFile(path.join(process.cwd(), "scripts/schema.sql"), "utf8");
        await pool.query(sql);
        console.log("[ossz] tables created");
        tablesExist = true;
      } catch (error) {
        console.warn(`[ossz] schema create failed: ${(error as Error).message.slice(0, 200)}`);
        return;
      }
    }

    if (hasProducts) return; // already populated — nothing to do

    // 2. Seed. Each script is idempotent and self-contained.
    console.log("[ossz] seeding catalogue and reference data");
    const seeds = [
      "scripts/seed.mjs",
      "scripts/seed-fr.mjs",
      "scripts/seed-real.mjs",
      "scripts/seed-staff-logins.mjs",
    ];
    for (const step of seeds) {
      try {
        await run("node", [step], { cwd: process.cwd(), timeout: 60_000, env: process.env });
        console.log(`[ossz] ${step} ok`);
      } catch (error) {
        console.warn(`[ossz] ${step} skipped: ${(error as Error).message.slice(0, 160)}`);
      }
    }
    console.log("[ossz] setup complete");
  } catch (error) {
    console.warn(`[ossz] bootstrap skipped: ${String(error).slice(0, 160)}`);
  } finally {
    await pool?.end().catch(() => {});
  }
}
