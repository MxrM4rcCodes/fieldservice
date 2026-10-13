import { NextResponse } from "next/server";
import { q, one } from "@/lib/db";
import { requireUser } from "@/lib/auth";
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const u = await requireUser(); const { slug } = await params;
  const lesson: any = await one("SELECT * FROM lessons WHERE slug=?", [slug]);
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  const blocks = await q("SELECT heading,body FROM lesson_content_blocks WHERE lesson_id=? ORDER BY sort", [lesson.id]);
  const questions = await q("SELECT id,prompt,choices FROM quiz_questions WHERE lesson_id=? ORDER BY sort", [lesson.id]);
  const progress: any = await one("SELECT status,percent FROM lesson_progress WHERE user_id=? AND lesson_id=?", [u.id, lesson.id]);
  const attempts = await q("SELECT score,total,created_at FROM quiz_attempts WHERE user_id=? AND lesson_id=? ORDER BY created_at DESC LIMIT 5", [u.id, lesson.id]);
  return NextResponse.json({ ...lesson, objectives: JSON.parse(lesson.objectives), blocks, questions: questions.map((x: any) => ({ ...x, choices: JSON.parse(x.choices) })), progress: progress || { status: "not_started", percent: 0 }, attempts });
}
