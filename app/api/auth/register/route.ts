import { NextResponse } from "next/server";
import { q, one, run, uid, now } from "@/lib/db";
import { hashPw, setSession } from "@/lib/auth";
export async function POST(req: Request) {
  const { name, email, password } = await req.json().catch(() => ({}));
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || "") || (password || "").length < 10)
    return NextResponse.json({ error: "Name, a valid email, and a password of 10+ characters are required." }, { status: 400 });
  if (await one("SELECT id FROM users WHERE email=?", [email.toLowerCase()])) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  const user = { id: uid(), email: email.toLowerCase(), role: "learner" };
  await run("INSERT INTO users (id,email,name,password_hash,role,track,created_at) VALUES (?,?,?,?,?,?,?)", [user.id, user.email, name.trim(), await hashPw(password), "learner", "course14", now()]);
  await setSession(user);
  return NextResponse.json({ ok: true });
}
