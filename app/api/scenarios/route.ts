import { NextResponse } from "next/server";
import { q, run, one, uid, now } from "@/lib/db";
import { requireUser, assertOwner, guard } from "@/lib/auth";
import { applyEffects, emptyScores, scenarioGrade } from "@/lib/scoring";

async function nodePayload(runRow: any) {
  const node: any = await one("SELECT * FROM scenario_nodes WHERE scenario_id=? AND node_key=?", [runRow.scenario_id, runRow.current_node]);
  const choices = node ? await q("SELECT id,label FROM scenario_choices WHERE node_id=? ORDER BY sort", [node.id]) : [];
  const scores = JSON.parse(runRow.scores || "{}");
  return { runId: runRow.id, status: runRow.status, node: node ? { key: node.node_key, kind: node.kind, title: node.title, body: node.body } : null, choices, scores, grade: runRow.status === "finished" ? scenarioGrade({ ...emptyScores(), ...scores }) : null };
}
export async function GET(req: Request) { return guard(async () => {
  const u = await requireUser(); const url = new URL(req.url); const runId = url.searchParams.get("runId");
  if (runId) { const r: any = await one("SELECT * FROM scenario_runs WHERE id=?", [runId]); assertOwner(r, u); return NextResponse.json(await nodePayload(r)); }
  const list = await q("SELECT s.*, (SELECT status FROM scenario_runs r WHERE r.scenario_id=s.id AND r.user_id=? ORDER BY r.started_at DESC LIMIT 1) AS my_status FROM troubleshooting_scenarios s ORDER BY s.title", [u.id]);
  return NextResponse.json(list);
}); }
export async function POST(req: Request) { return guard(async () => {
  const u = await requireUser(); const body = await req.json().catch(() => ({}));
  if (body.action === "start") {
    const s: any = await one("SELECT * FROM troubleshooting_scenarios WHERE slug=?", [body.slug || ""]);
    if (!s) return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    const r = { id: uid(), user_id: u.id, scenario_id: s.id, current_node: "start", status: "in_progress", scores: JSON.stringify(emptyScores()), started_at: now(), finished_at: null };
    await run("INSERT INTO scenario_runs (id,user_id,scenario_id,current_node,status,scores,started_at,finished_at) VALUES (?,?,?,?,?,?,?,?)", [r.id, r.user_id, r.scenario_id, r.current_node, r.status, r.scores, r.started_at, r.finished_at]);
    return NextResponse.json({ ...(await nodePayload(r)), scenario: { slug: s.slug, title: s.title, complaint: s.complaint, context: s.context, equipment: s.difficulty } });
  }
  if (body.action === "choose") {
    const r: any = await one("SELECT * FROM scenario_runs WHERE id=?", [body.runId || ""]);
    assertOwner(r, u);
    if (r.status !== "in_progress") return NextResponse.json({ error: "Run already finished" }, { status: 409 });
    const node: any = await one("SELECT * FROM scenario_nodes WHERE scenario_id=? AND node_key=?", [r.scenario_id, r.current_node]);
    const choice: any = await one("SELECT * FROM scenario_choices WHERE id=? AND node_id=?", [body.choiceId || "", node?.id || ""]);
    if (!choice) return NextResponse.json({ error: "Choice not valid for current node" }, { status: 400 });
    const scores = applyEffects({ ...emptyScores(), ...JSON.parse(r.scores || "{}") }, JSON.parse(choice.effects || "{}"));
    await run("INSERT INTO scenario_events (id,run_id,node_key,choice_label,effects,created_at) VALUES (?,?,?,?,?,?)", [uid(), r.id, r.current_node, choice.label, choice.effects, now()]);
    const nextNode: any = await one("SELECT * FROM scenario_nodes WHERE scenario_id=? AND node_key=?", [r.scenario_id, choice.next_key]);
    const finished = nextNode?.kind === "end";
    await run("UPDATE scenario_runs SET current_node=?,scores=?,status=?,finished_at=? WHERE id=?", [choice.next_key, JSON.stringify(scores), finished ? "finished" : "in_progress", finished ? now() : null, r.id]);
    const updated: any = await one("SELECT * FROM scenario_runs WHERE id=?", [r.id]);
    return NextResponse.json({ ...(await nodePayload(updated)), reveal: choice.reveal, chosenLabel: choice.label });
  }
  return NextResponse.json({ error: "action must be start|choose" }, { status: 400 });
}); }
