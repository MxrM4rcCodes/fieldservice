# CGS ORIS Field Service Academy

**Learn the Systems. Diagnose the Faults. Master the Workflow.**

A database-backed, multi-user training and interview-preparation platform for the CGS ORIS Americas Field Service Technician role: industrial printing (Platinum Technologies), material scanning (METIS), and ORIS color-workflow software.

> Independent educational application. Not affiliated with or endorsed by CGS ORIS, METIS, or Platinum Technologies. All diagrams are conceptual educational models, not manufacturer schematics. Never follow this app over current manufacturer documentation or your authorization.

## Quick start

```bash
npm install
npm run dev            # http://localhost:3000  (binds 0.0.0.0)
```

The database initializes and seeds itself on first request (14 lessons, 70 quiz questions, 10 scenarios, 65 flashcards, interview bank, demo users). To initialize without opening the UI after a production build: `npm run seed`.

**Seeded demo accounts** (change/remove in production): `learner@academy.local / learner12345`, `admin@academy.local / admin12345` (admin email overridable via `ADMIN_EMAIL`).

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm test` | Vitest: scoring, authorization, content-integrity (16 tests) |
| `npm run typecheck` | TypeScript check |
| `npm run seed` | Initialize + seed the database |

## Database: PostgreSQL in production, embedded SQLite locally

- **Production:** set `DATABASE_URL=postgres://…` (Neon, Supabase, Vercel Postgres). Canonical migration: `db/migrations/001_init.sql` (`psql "$DATABASE_URL" -f db/migrations/001_init.sql`). The app also applies the equivalent DDL idempotently on boot.
- **Local/sandbox (no Postgres provisioned):** the same schema runs on a server-side SQLite file (`data/academy.db`, Node's built-in `node:sqlite`). Same tables, same queries (`?` placeholders are translated to `$n` for Postgres), same server-enforced per-user isolation. This is a real database in both modes — authenticated progress is never stored in localStorage.
- Copy `.env.example` to `.env` and set a strong `AUTH_SECRET`.

## What's inside

- **Tracks:** 3-Day Interview Bootcamp and the Full 14-Day Course share the same lessons, quizzes, scenarios, and progress records (no duplication).
- **Modules:** Dashboard (interview countdown, competency mastery vs study-priority weights, adaptive recommendations), interactive Systems Map (5 pathways, pan/zoom/print), Printer Anatomy Lab with Trace-the-Fault, Troubleshooting Decision Tree with safety gate, Branching Diagnostic Simulator (10 evidence-based scenarios, server-scored, safety-penalized), Color Science Lab (RGB/CMYK, Lab/Delta E calculator, gamut, substrate — with explicit "screens don't measure color" limits), ORIS Product Explorer with needs-matching, METIS Imaging Lab with scan-vs-print split test, Flashcards & Glossary (65 terms, DB mastery, spaced review), Interview Studio (transparent rubric + rule-based feedback, explicitly **not AI**), Service Documentation Lab (full ticket, printable), Study & Print Center (10 print-optimized sheets, browser printing), and an admin-only Content Administration area (server-enforced role, revision history).
- **Assessment honesty:** quiz answers are graded server-side and never sent to the browser before submission; competency mastery derives only from recorded attempts/runs/reviews; the 35/25/15/15/10 study-priority weights are displayed separately from observed mastery.

## Architecture & docs

- `docs/ARCHITECTURE.md` — stack, data layer, auth/authorization model, scoring, deployment (Vercel).
- `docs/REFERENCES.md` — source/evidence notes and confidence policy.
- `docs/LIMITATIONS_ROADMAP.md` — known limitations and future work.

## Safety & accuracy policy

Teaches OSHA LOTO principles, interlock/PPE/SDS discipline ("an e-stop is not energy isolation"), and evidence-first diagnosis. It deliberately does **not** teach bypass procedures, proprietary service menus, or invented model-specific specifications; unverified model details are labelled as such.
