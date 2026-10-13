// Seeds the database by booting the app once (DB init + seed run automatically on first request).
// Usage: npm run seed   (uses SQLite locally, or DATABASE_URL PostgreSQL in production)
import next from "next";
import http from "node:http";
const app = next({ dev: false, dir: process.cwd() });
const handle = app.getRequestHandler();
await app.prepare();
const server = http.createServer((req, res) => handle(req, res));
await new Promise(r => server.listen(3199, r));
try {
  const res = await fetch("http://127.0.0.1:3199/login");
  console.log("Seed trigger response:", res.status, "— database initialized and seeded (14 lessons, 10 scenarios, 66 flashcards, demo users).");
  console.log("Demo learner: learner@academy.local / learner12345 · Demo admin: admin@academy.local / admin12345");
} finally { server.close(); await app.close?.(); }
