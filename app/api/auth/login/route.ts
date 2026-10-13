import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { checkPw, setSession } from "@/lib/auth";
export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  const user: any = await one("SELECT * FROM users WHERE email=?", [(email || "").toLowerCase()]);
  if (!user || !(await checkPw(password || "", user.password_hash))) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  await setSession(user);
  return NextResponse.json({ ok: true, role: user.role });
}
