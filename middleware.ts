import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
const PUBLIC = ["/login", "/register"];
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.includes(pathname) || pathname.startsWith("/api/auth")) return NextResponse.next();
  const token = req.cookies.get("session")?.value;
  const deny = () => pathname.startsWith("/api") ? NextResponse.json({ error: "Unauthorized" }, { status: 401 }) : NextResponse.redirect(new URL("/login", req.url));
  if (!token) return deny();
  try { await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-change-me-academy-secret")); return NextResponse.next(); }
  catch { return deny(); }
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
