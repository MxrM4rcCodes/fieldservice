// Dual-dialect data layer.
//  - Production: set DATABASE_URL=postgres://... (Neon / Supabase / Vercel Postgres) -> uses `pg`.
//  - Local/sandbox (no Postgres provisioned): embedded server-side SQLite file at data/academy.db via node:sqlite.
// Same logical schema (db/migrations/001_init.sql), same queries (`?` placeholders are translated to $n for Postgres),
// same server-enforced per-user isolation. This is a real database in both modes -- never localStorage.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const usingPostgres = !!process.env.DATABASE_URL?.startsWith("postgres");
export const uid = () => crypto.randomUUID();
export const now = () => new Date().toISOString();

type Row = Record<string, any>;
let pgPool: any = null;
let sqliteDb: any = null;
let ready: Promise<void> | null = null;

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'learner', interview_date TEXT, track TEXT DEFAULT 'course14', created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS learning_tracks (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS courses (id TEXT PRIMARY KEY, track_id TEXT NOT NULL, title TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS modules (id TEXT PRIMARY KEY, course_id TEXT NOT NULL, title TEXT NOT NULL, sort INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS lessons (id TEXT PRIMARY KEY, module_id TEXT NOT NULL, day INTEGER NOT NULL, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL, minutes INTEGER NOT NULL, competency TEXT NOT NULL, objectives TEXT NOT NULL, prerequisites TEXT NOT NULL, field_example TEXT NOT NULL, summary_review TEXT NOT NULL, sources TEXT NOT NULL, confidence TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS lesson_content_blocks (id TEXT PRIMARY KEY, lesson_id TEXT NOT NULL, sort INTEGER NOT NULL, heading TEXT NOT NULL, body TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS lesson_progress (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, lesson_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'not_started', percent INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, UNIQUE(user_id, lesson_id));
CREATE TABLE IF NOT EXISTS quiz_questions (id TEXT PRIMARY KEY, lesson_id TEXT NOT NULL, sort INTEGER NOT NULL, prompt TEXT NOT NULL, choices TEXT NOT NULL, answer INTEGER NOT NULL, explanation TEXT NOT NULL, review_hint TEXT NOT NULL, competency TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS quiz_attempts (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, lesson_id TEXT NOT NULL, score INTEGER NOT NULL, total INTEGER NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS quiz_answers (id TEXT PRIMARY KEY, attempt_id TEXT NOT NULL, question_id TEXT NOT NULL, chosen INTEGER NOT NULL, correct INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS troubleshooting_scenarios (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, complaint TEXT NOT NULL, context TEXT NOT NULL, competency TEXT NOT NULL, difficulty TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS scenario_nodes (id TEXT PRIMARY KEY, scenario_id TEXT NOT NULL, node_key TEXT NOT NULL, kind TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, UNIQUE(scenario_id, node_key));
CREATE TABLE IF NOT EXISTS scenario_choices (id TEXT PRIMARY KEY, node_id TEXT NOT NULL, sort INTEGER NOT NULL, label TEXT NOT NULL, next_key TEXT NOT NULL, effects TEXT NOT NULL, reveal TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS scenario_runs (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, scenario_id TEXT NOT NULL, current_node TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'in_progress', scores TEXT NOT NULL DEFAULT '{}', started_at TEXT NOT NULL, finished_at TEXT);
CREATE TABLE IF NOT EXISTS scenario_events (id TEXT PRIMARY KEY, run_id TEXT NOT NULL, node_key TEXT NOT NULL, choice_label TEXT NOT NULL, effects TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS flashcards (id TEXT PRIMARY KEY, term TEXT NOT NULL, definition TEXT NOT NULL, category TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS flashcard_mastery (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, card_id TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'learning', reviews INTEGER NOT NULL DEFAULT 0, last_review TEXT, UNIQUE(user_id, card_id));
CREATE TABLE IF NOT EXISTS competency_scores (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, competency TEXT NOT NULL, mastery REAL NOT NULL DEFAULT 0, evidence INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, UNIQUE(user_id, competency));
CREATE TABLE IF NOT EXISTS user_notes (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, lesson_id TEXT, body TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS interview_questions (id TEXT PRIMARY KEY, category TEXT NOT NULL, prompt TEXT NOT NULL, follow_up TEXT NOT NULL, model_answer TEXT NOT NULL, sort INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS interview_attempts (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, question_id TEXT NOT NULL, response TEXT NOT NULL, self_scores TEXT NOT NULL, feedback TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS service_tickets (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, scenario_slug TEXT, equipment TEXT NOT NULL, symptom TEXT NOT NULL, safety TEXT NOT NULL, config TEXT NOT NULL, tests TEXT NOT NULL, observations TEXT NOT NULL, actions TEXT NOT NULL, verification TEXT NOT NULL, communication TEXT NOT NULL, follow_up TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS source_references (id TEXT PRIMARY KEY, title TEXT NOT NULL, kind TEXT NOT NULL, note TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS content_revisions (id TEXT PRIMARY KEY, admin_id TEXT NOT NULL, entity TEXT NOT NULL, entity_id TEXT NOT NULL, summary TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_runs_user ON scenario_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON service_tickets(user_id);
`;

async function init(): Promise<void> {
  if (usingPostgres) {
    const { Pool } = await import("pg");
    pgPool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false } });
    for (const stmt of SCHEMA.split(";").map(s => s.trim()).filter(Boolean)) await pgPool.query(stmt);
  } else {
    const { DatabaseSync } = await import("node:sqlite" as any);
    const dir = path.join(process.cwd(), "data");
    fs.mkdirSync(dir, { recursive: true });
    sqliteDb = new DatabaseSync(path.join(dir, "academy.db"));
    sqliteDb.exec(SCHEMA);
  }
  const { seedIfEmpty } = await import("./seed");
  await seedIfEmpty({ q, run });
}
export function readyDb(): Promise<void> { if (!ready) ready = init(); return ready; }

function toPg(sql: string): string { let i = 0; let out = sql.replace(/\?/g, () => `$${++i}`); if (/^INSERT OR IGNORE INTO/i.test(out.trim())) out = out.replace(/INSERT OR IGNORE INTO/i, "INSERT INTO") + " ON CONFLICT DO NOTHING"; return out; }

async function ensureReady(): Promise<void> { // handles exist during seed (set before seedIfEmpty) -> no self-deadlock
  if (!pgPool && !sqliteDb) await readyDb();
}
export async function q<T = Row>(sql: string, params: any[] = []): Promise<T[]> {
  await ensureReady();
  if (pgPool) { const r = await pgPool.query(toPg(sql), params); return r.rows.map((x: any) => ({ ...x })) as T[]; }
  // node:sqlite rows have a null prototype -> spread into plain objects so RSC can serialize them to Client Components.
  return (sqliteDb.prepare(sql).all(...params) as any[]).map(x => ({ ...x })) as T[];
}
export async function one<T = Row>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await q<T>(sql, params); return rows[0] ?? null;
}
export async function run(sql: string, params: any[] = []): Promise<void> {
  await ensureReady();
  if (pgPool) { await pgPool.query(toPg(sql), params); return; }
  sqliteDb.prepare(sql).run(...params);
}
