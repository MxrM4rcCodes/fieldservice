import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { one } from "./db";

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-change-me-academy-secret");
export const hashPw = (pw: string) => bcrypt.hash(pw, 10);
export const checkPw = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export async function setSession(user: { id: string; email: string; role: string }) {
  const token = await new SignJWT({ email: user.email, role: user.role }).setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt().setExpirationTime("7d").sign(secret());
  (await cookies()).set("session", token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function clearSession() { (await cookies()).set("session", "", { httpOnly: true, path: "/", maxAge: 0 }); }

export type SessionUser = { id: string; email: string; name: string; role: string; interview_date: string | null; track: string };
export async function currentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    // Re-read the user row so role/track changes take effect and deleted users lose access.
    return await one<SessionUser>("SELECT id,email,name,role,interview_date,track FROM users WHERE id=?", [payload.sub]);
  } catch { return null; }
}
export async function requireUser(): Promise<SessionUser> {
  const u = await currentUser();
  if (!u) throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  return u;
}
export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireUser();
  if (u.role !== "admin") throw new Response(JSON.stringify({ error: "Admin only" }), { status: 403, headers: { "Content-Type": "application/json" } });
  return u;
}
/** Ownership guard: a record may only be touched by its owner (or an admin). Tested in tests/authz.test.ts. */
export function assertOwner(record: { user_id: string } | null, user: { id: string; role: string }): asserts record {
  if (!record) throw new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  if (record.user_id !== user.id && user.role !== "admin") throw new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });
}

/** Convert a thrown Response (from requireUser/assertOwner) into a returned one in route handlers. */
export async function guard<T>(fn: () => Promise<T>): Promise<T | Response> {
  try { return await fn(); } catch (e) { if (e instanceof Response) return e; throw e; }
}
