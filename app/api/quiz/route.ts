import { NextResponse } from "next/server";
import { q, run, one, uid, now } from "@/lib/db";
import { requireUser } from "@/lib/auth";
// Server-graded quiz: correct answers never leave the server before submission.
export async function POST(req: Request) {
  const u = await requireUser();
  const { lessonSlug, answers } = await req.json().catch(() => ({}));
  const lesson: any = await one("SELECT id FROM lessons WHERE slug=?", [lessonSlug || ""]);
  if (!lesson || !Array.isArray(answers)) return NextResponse.json({ error: "lessonSlug and answers[] required" }, { status: 400 });
  const questions = await q("SELECT * FROM quiz_questions WHERE lesson_id=? ORDER BY sort", [lesson.id]);
  if (answers.length !== questions.length) return NextResponse.json({ error: `Expected ${questions.length} answers` }, { status: 400 });
  const attemptId = uid();
  let score = 0;
  const detail = questions.map((qq: any, i: number) => {
    const chosen = Number(answers[i]); const correct = chosen === qq.answer ? 1 : 0; score += correct;
    return { questionId: qq.id, prompt: qq.prompt, choices: JSON.parse(qq.choices), chosen, answer: qq.answer, correct: !!correct, explanation: qq.explanation, reviewHint: qq.review_hint, competency: qq.competency };
  });
  await run("INSERT INTO quiz_attempts (id,user_id,lesson_id,score,total,created_at) VALUES (?,?,?,?,?,?)", [attemptId, u.id, lesson.id, score, questions.length, now()]);
  for (const d of detail) await run("INSERT INTO quiz_answers (id,attempt_id,question_id,chosen,correct) VALUES (?,?,?,?,?)", [uid(), attemptId, d.questionId, d.chosen, d.correct ? 1 : 0]);
  if (score >= Math.ceil(questions.length * 0.6)) {
    const existing: any = await one("SELECT id FROM lesson_progress WHERE user_id=? AND lesson_id=?", [u.id, lesson.id]);
    if (existing) await run("UPDATE lesson_progress SET status='completed',percent=100,updated_at=? WHERE id=?", [now(), existing.id]);
    else await run("INSERT INTO lesson_progress (id,user_id,lesson_id,status,percent,updated_at) VALUES (?,?,?,'completed',100,?)", [uid(), u.id, lesson.id, now()]);
  }
  return NextResponse.json({ attemptId, score, total: questions.length, passed: score >= Math.ceil(questions.length * 0.6), detail });
}
