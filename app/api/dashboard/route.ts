import { NextResponse } from "next/server";
import { q, one } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { COMPETENCIES, STUDY_WEIGHTS, recommendNext } from "@/lib/scoring";
const CAT2COMP: Record<string, string> = { "Printer Hardware": "Hardware, Diagnostics & Safety", "Inkjet Defects": "Hardware, Diagnostics & Safety", "Safety": "Hardware, Diagnostics & Safety", "RIP & Networking": "Hardware, Diagnostics & Safety", "Color Science": "Color Science & ORIS", "ORIS Products": "Color Science & ORIS", "Scanning": "METIS Scanning", "Customer Service": "Customer Support & Documentation" };
export async function GET() {
  const u = await requireUser();
  const lessons = await q("SELECT l.id,l.day,l.slug,l.title,l.competency,p.status,p.percent,p.updated_at FROM lessons l LEFT JOIN lesson_progress p ON p.lesson_id=l.id AND p.user_id=? ORDER BY l.day", [u.id]);
  const answers = await q("SELECT qq.competency AS comp, qa.correct AS correct FROM quiz_answers qa JOIN quiz_attempts a ON a.id=qa.attempt_id JOIN quiz_questions qq ON qq.id=qa.question_id WHERE a.user_id=?", [u.id]);
  const runs = await q("SELECT s.competency AS comp, r.status, r.scores FROM scenario_runs r JOIN troubleshooting_scenarios s ON s.id=r.scenario_id WHERE r.user_id=?", [u.id]);
  const cards = await q("SELECT f.category, m.state FROM flashcard_mastery m JOIN flashcards f ON f.id=m.card_id WHERE m.user_id=?", [u.id]);
  const mastery: Record<string, number> = {}, evidence: Record<string, number> = {};
  for (const c of COMPETENCIES) { mastery[c] = 0; evidence[c] = 0; }
  const agg: Record<string, { p: number; t: number }> = {};
  const add = (comp: string, passed: number, total: number) => { if (!agg[comp]) agg[comp] = { p: 0, t: 0 }; agg[comp].p += passed; agg[comp].t += total; };
  for (const a of answers as any[]) add(a.comp, a.correct ? 1 : 0, 1);
  for (const r of runs as any[]) if (r.status === "finished") { const s = JSON.parse(r.scores || "{}"); const pts = Object.values(s).reduce((x: number, y: any) => x + Number(y), 0); add(r.comp, pts >= 45 ? 1 : 0, 1); }
  for (const c of cards as any[]) { const comp = CAT2COMP[c.category]; if (comp) add(comp, c.state === "known" ? 1 : 0, 1); }
  for (const c of COMPETENCIES) if (agg[c]) { mastery[c] = Math.round((agg[c].p / agg[c].t) * 100); evidence[c] = agg[c].t; }
  const completed = lessons.filter((l: any) => l.status === "completed").length;
  const incomplete = lessons.filter((l: any) => l.status !== "completed").map((l: any) => ({ slug: l.slug, title: `Day ${l.day}: ${l.title}`, competency: l.competency }));
  const weakest = [...COMPETENCIES].sort((a, b) => (mastery[a] - mastery[b]) || ((evidence[a] || 0) - (evidence[b] || 0)))[0];
  const notes = await q("SELECT id,body,created_at,lesson_id FROM user_notes WHERE user_id=? ORDER BY created_at DESC LIMIT 5", [u.id]);
  const tickets = await q("SELECT COUNT(*) AS n FROM service_tickets WHERE user_id=?", [u.id]);
  const interviewCount: any = await one("SELECT COUNT(*) AS n FROM interview_attempts WHERE user_id=?", [u.id]);
  let countdown: number | null = null;
  if (u.interview_date) countdown = Math.ceil((new Date(u.interview_date + "T12:00:00").getTime() - Date.now()) / 86400000);
  return NextResponse.json({ user: { name: u.name, track: u.track, interviewDate: u.interview_date, countdownDays: countdown }, overallPercent: Math.round(lessons.reduce((s: number, l: any) => s + (l.percent || 0), 0) / Math.max(1, lessons.length)), completedLessons: completed, totalLessons: lessons.length, lessons, mastery, evidence, studyWeights: STUDY_WEIGHTS, weakest, recommendation: recommendNext({ mastery, evidence, incompleteLessons: incomplete }), recent: lessons.filter((l: any) => l.updated_at).slice(0, 5), notes, counts: { tickets: tickets[0]?.n || 0, interviewAttempts: interviewCount?.n || 0, scenarioRuns: runs.length } });
}
