import { NextResponse } from "next/server";
import { run, one, uid, now } from "@/lib/db";
import { requireUser } from "@/lib/auth";
export async function POST(req: Request) {
  const u = await requireUser();
  const { lessonSlug, percent, status } = await req.json().catch(() => ({}));
  const lesson: any = await one("SELECT id FROM lessons WHERE slug=?", [lessonSlug || ""]);
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  const pct = Math.max(0, Math.min(100, Number(percent) || 0));
  const st = status === "completed" || pct >= 100 ? "completed" : pct > 0 ? "in_progress" : "not_started";
  const existing: any = await one("SELECT id,percent FROM lesson_progress WHERE user_id=? AND lesson_id=?", [u.id, lesson.id]);
  if (existing) await run("UPDATE lesson_progress SET status=?,percent=?,updated_at=? WHERE id=?", [st, Math.max(existing.percent, pct), now(), existing.id]);
  else await run("INSERT INTO lesson_progress (id,user_id,lesson_id,status,percent,updated_at) VALUES (?,?,?,?,?,?)", [uid(), u.id, lesson.id, st, pct, now()]);
  return NextResponse.json({ ok: true, status: st, percent: Math.max(existing?.percent || 0, pct) });
}
