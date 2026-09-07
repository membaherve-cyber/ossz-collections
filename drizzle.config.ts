import type { Config } from "drizzle-kit";

/**
 * Reads DATABASE_URL from the environment so the same command works locally and
 * against the production database. Falls back to the sandbox DB for convenience.
 */
export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
} satisfies Config;
