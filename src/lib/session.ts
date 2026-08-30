import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_COOKIE = "stmark_admin_session";
const SUPER_ADMIN_COOKIE = "stmark_super_admin_session";

function signValue(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function adminSecret() {
  // Derived from the admin password itself so no extra env var is needed.
  return process.env.ADMIN_PASSWORD || "insecure-dev-secret";
}

export async function createAdminSession() {
  const secret = adminSecret();
  const value = "admin";
  const token = `${value}.${signValue(value, secret)}`;
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function hasValidAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const [value, sig] = token.split(".");
  if (!value || !sig) return false;
  const expected = signValue(value, adminSecret());
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

function superAdminSecret() {
  // Derived from the super admin password itself so no extra signing secret is needed.
  return process.env.SUPER_ADMIN_PASSWORD || "insecure-dev-super-secret";
}

export async function createSuperAdminSession() {
  const secret = superAdminSecret();
  const value = "super-admin";
  const token = `${value}.${signValue(value, secret)}`;
  const store = await cookies();
  store.set(SUPER_ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });
}

export async function destroySuperAdminSession() {
  const store = await cookies();
  store.delete(SUPER_ADMIN_COOKIE);
}

export async function hasValidSuperAdminSession() {
  const store = await cookies();
  const token = store.get(SUPER_ADMIN_COOKIE)?.value;
  if (!token) return false;
  const [value, sig] = token.split(".");
  if (!value || !sig) return false;
  const expected = signValue(value, superAdminSecret());
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export { ADMIN_COOKIE, SUPER_ADMIN_COOKIE };
