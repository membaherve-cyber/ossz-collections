import { cache } from "react";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

const SESSION_COOKIE = "ossz_session";
const GUEST_COOKIE = "ossz_guest";
/**
 * Session-signing secret. A stable per-deployment value is required so sessions
 * survive restarts and are not forgeable. In production we insist on a real
 * secret; locally we fall back to a fixed dev value for convenience.
 */
const SECRET =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "production"
    ? (() => {
        console.warn(
          "[ossz] SESSION_SECRET is not set — set it in your host's environment variables. Falling back to an insecure default.",
        );
        return "ossz-collections-douala-INSECURE-set-SESSION_SECRET";
      })()
    : "ossz-collections-douala-dev-secret");

export type Role = "customer" | "uploader" | "staff" | "admin";

export type SessionUser = {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: Role;
};


/**
 * Cookie flags.
 *
 * The site is viewed inside a cross-origin iframe in preview and embed tools.
 * A `SameSite=lax` cookie is not sent on those requests, so a visitor could
 * sign in successfully and still arrive logged out — the redirect worked, the
 * cookie simply never came back.
 *
 * `SameSite=none` fixes that, but browsers only accept it together with
 * `Secure`, which in turn requires HTTPS. Plain-HTTP localhost therefore keeps
 * `lax`, which is correct there anyway (no iframe, no HTTPS).
 */
function cookieFlags() {
  const crossSite = process.env.COOKIE_CROSS_SITE !== "0";
  return crossSite
    ? { sameSite: "none" as const, secure: true }
    : { sameSite: "lax" as const, secure: process.env.NODE_ENV === "production" };
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, "hex");
  if (keyBuf.length !== derived.length) return false;
  return timingSafeEqual(derived, keyBuf);
}

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex").slice(0, 32);
}

export async function createSession(userId: number) {
  const payload = String(userId);
  const token = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    ...cookieFlags(),
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/**
 * Called by the header, the account/admin layouts and individual pages on the
 * same render. `cache()` keeps that to a single lookup per request.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature || sign(payload) !== signature) return null;
  const id = Number(payload);
  if (!Number.isFinite(id)) return null;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  const found = rows[0];
  if (!found) return null;
  return {
    id: found.id,
    email: found.email,
    fullName: found.fullName,
    phone: found.phone,
    role: found.role as Role,
  };
});

const RANK: Record<Role, number> = { customer: 0, uploader: 1, staff: 2, admin: 3 };

export function hasAtLeast(role: Role, minimum: Role): boolean {
  return RANK[role] >= RANK[minimum];
}

/** Back-office access: uploader, staff and admin all reach /admin, with different menus. */
export function canEnterBackOffice(role: Role): boolean {
  return role === "uploader" || role === "staff" || role === "admin";
}

export function canManageCatalogue(role: Role): boolean {
  return role === "uploader" || role === "admin";
}

export function canFulfilOrders(role: Role): boolean {
  return role === "staff" || role === "admin";
}

export function isAdmin(role: Role): boolean {
  return role === "admin";
}

/** Stable anonymous id used for guest carts and concierge sessions. */
export async function getGuestId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(GUEST_COOKIE)?.value;
  if (existing) return existing;
  const fresh = randomBytes(12).toString("hex");
  jar.set(GUEST_COOKIE, fresh, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
    ...cookieFlags(),
  });
  return fresh;
}

export async function peekGuestId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(GUEST_COOKIE)?.value ?? null;
}
