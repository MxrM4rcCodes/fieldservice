# Architecture

## Stack
Next.js 15 (App Router) + React 19 + TypeScript, Tailwind CSS, server route handlers as the API layer. Chosen for Vercel-compatible deployment, server components, and a single codebase for UI + API.

## Data layer (`lib/db.ts`)
- Dual-dialect: `pg` Pool when `DATABASE_URL` is a `postgres://` URL; otherwise Node's built-in `node:sqlite` against `data/academy.db`.
- One logical schema (22 tables per spec §5) expressed portably: app-generated UUID primary keys, ISO text timestamps, `ON CONFLICT` upserts. SQLite `INSERT OR IGNORE` is rewritten for Postgres at query translation; `?` placeholders become `$n`.
- Schema auto-applies on first boot; `db/migrations/001_init.sql` is the reviewable canonical migration. Seed (`lib/seed.ts`) runs only when content tables are empty and inserts versioned content from `lib/content/*`.
- Rows are spread into plain objects (node:sqlite returns null-prototype rows, which React Server Components cannot serialize).

## Authentication & authorization
- Email/password with bcrypt hashing; sessions are HS256 JWTs (jose) in httpOnly cookies (7 days). Middleware verifies the JWT at the edge; pages redirect to `/login`, APIs get 401 JSON.
- `currentUser()` re-reads the user row per request, so role/track changes apply immediately.
- **User isolation (RLS-equivalent, server-enforced):** every private query is scoped by the session `user_id`; single-record access goes through `assertOwner()` (404 for missing, 403 for another learner's record, admin override). Cross-user read/edit of tickets and scenario runs were verified to return 403 in live acceptance tests. Admin APIs call `requireAdmin()` server-side — hiding the UI is never the control. Add native Postgres RLS policies before exposing the database to anything other than this app tier.
- Quiz grading is server-side; correct answers are never serialized to the client before submission.

## Scoring (`lib/scoring.ts`)
- Competencies: Hardware/Diagnostics/Safety, Color & ORIS, METIS, Customer Support & Documentation, Company & Interview. Study-priority weights 35/25/15/15/10 are planning guidance, UI-labelled as distinct from mastery.
- Mastery = recorded evidence only (quiz answers, finished scenario runs, flashcard reviews). The adaptive recommendation ranks incomplete lessons by lowest mastery, then least evidence.
- Scenario engine: node/choice graphs in DB; the server validates the choice against the run's current node, records a `scenario_events` row, applies rubric effects (safety, evidence, hypothesis, least-invasive, interpretation, verification, documentation, communication), and finishes at `end` nodes. Grade = capped point sum with an unsafe override when safety < 0. Test results (`reveal`) are disclosed only after the test is chosen.
- Interview Studio: 5-dimension self-assessment rubric + deterministic rule-based feedback over observable response features, stored with `aiGenerated: false`. No AI service is configured; if one is added later, it must be a server-side route and labelled.

## Deployment (Vercel)
Import the repo, set `DATABASE_URL` (Postgres) and `AUTH_SECRET`, deploy. `next.config.mjs` marks `pg`/`bcryptjs` as server-external packages. Local SQLite is for development/sandbox only — Vercel's filesystem is ephemeral, so production must use Postgres.
