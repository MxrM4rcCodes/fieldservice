# Known Limitations & Roadmap

## Known limitations
- Local development uses embedded SQLite (Node `node:sqlite`, experimental warning on boot). Production must set a PostgreSQL `DATABASE_URL`; Vercel's ephemeral filesystem makes the file DB unsuitable there.
- Content administration covers lesson title/summary edits, quiz-question and flashcard creation, and source-reference edits with revision history. Scenario graphs are edited as versioned, test-covered content in `lib/content/scenarios.ts` rather than through the UI, so branching integrity stays under automated tests.
- Interview feedback is rubric self-assessment + rule-based text checks. There is no AI evaluation (by design, until a server-side provider is configured and labelled).
- Printing uses the browser's print pipeline ("Save as PDF" works); there is no server PDF generator, and none is claimed.
- Diagrams are conceptual teaching models, not manufacturer schematics; METIS per-model specifications remain intentionally unverified.
- Seeded demo accounts ship with documented passwords for evaluation; rotate/remove before real use. `AUTH_SECRET` must be set in production.

## Roadmap (spec §9, after core)
Opt-in server-side AI tutor, personalized study-plan generation, badges, PWA/offline lesson caching, progress export, admin analytics, deeper simulations, and content import/export — none of which block the core learning loop.
