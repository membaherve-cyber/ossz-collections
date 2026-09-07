import { randomBytes, scryptSync } from "node:crypto";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db", ssl: /@(localhost|127\.0\.0\.1)/.test(process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db") ? false : { rejectUnauthorized: false } });

function hash(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

/**
 * Short-username back-office logins.
 *
 * Per the specification (§3) the Admin role covers "Owner / Manager", so the
 * manager account is granted admin rights. Staff is order-fulfilment only.
 */
const ACCOUNTS = [
  { username: "admin",   password: "admin",   role: "admin", name: "OSSZ Administrator", email: "admin@osszcollections.cm" },
  { username: "manager", password: "manager", role: "admin", name: "OSSZ Manager",       email: "manager@osszcollections.cm" },
  { username: "staff",   password: "staff",   role: "staff", name: "OSSZ Staff",         email: "staff.login@osszcollections.cm" },
];

async function main() {
  const c = await pool.connect();
  try {
    await c.query("begin");
    for (const a of ACCOUNTS) {
      await c.query(
        `insert into users (email, username, full_name, role, password_hash)
         values ($1,$2,$3,$4,$5)
         on conflict (email) do update
           set username = excluded.username,
               full_name = excluded.full_name,
               role = excluded.role,
               password_hash = excluded.password_hash`,
        [a.email, a.username, a.name, a.role, hash(a.password)],
      );
      console.log(`  ${a.username} / ${a.password}  ->  ${a.role}`);
    }
    await c.query("commit");
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
    await pool.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
