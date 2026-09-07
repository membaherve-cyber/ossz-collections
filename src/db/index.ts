import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

/**
 * Managed Postgres providers (Neon, Supabase, Vercel Postgres) require TLS,
 * while the local sandbox database does not. We enable SSL automatically for
 * any non-local host, and accept their certificate chain — these providers
 * terminate TLS with certs that Node does not bundle by default.
 *
 * Set DATABASE_SSL="disable" to force it off (e.g. a self-hosted DB on a
 * private network), or "require" to force it on.
 */
function sslConfig() {
  const mode = process.env.DATABASE_SSL;
  if (mode === "disable") return false;
  if (mode === "require") return { rejectUnauthorized: false };
  const isLocal = /@(localhost|127\.0\.0\.1|::1)[:/]/.test(databaseUrl ?? "");
  return isLocal ? false : { rejectUnauthorized: false };
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: sslConfig(),
    // Serverless platforms open many short-lived connections; a small ceiling
    // keeps us within managed-Postgres connection limits.
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
