import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
export async function GET() {
  const u = await requireUser();
  const lessons = await q("SELECT l.id,l.day,l.slug,l.title,l.summary,l.minutes,l.competency FROM lessons l ORDER BY l.day");
  const progress = await q("SELECT lesson_id,status,percent FROM lesson_progress WHERE user_id=?", [u.id]);
  const map = Object.fromEntries(progress.map((p: any) => [p.lesson_id, p]));
  return NextResponse.json(lessons.map((l: any) => ({ ...l, progress: map[l.id] || { status: "not_started", percent: 0 } })));
}
