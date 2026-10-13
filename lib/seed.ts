import bcrypt from "bcryptjs";
import { LESSONS_A } from "./content/lessons-a";
import { LESSONS_B } from "./content/lessons-b";
import { SCENARIOS } from "./content/scenarios";
import { FLASHCARDS } from "./content/flashcards";
import { INTERVIEW } from "./content/interview";

type DB = { q: (s: string, p?: any[]) => Promise<any[]>; run: (s: string, p?: any[]) => Promise<void> };
const id = () => Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);

export async function seedIfEmpty(db: DB) {
  const existing = await db.q("SELECT id FROM lessons LIMIT 1");
  const trackId = "trk", courseId = "crs";
  if (!existing.length) {
    await db.run("INSERT OR IGNORE INTO learning_tracks (id,slug,title,description) VALUES (?,?,?,?)", [trackId, "course14", "Full 14-Day Technical Course", "90 minutes per day: systems, safety, diagnosis, color, scanning, service, and interview readiness."]);
    await db.run("INSERT OR IGNORE INTO learning_tracks (id,slug,title,description) VALUES (?,?,?,?)", ["trk-boot", "bootcamp3", "3-Day Interview Bootcamp", "≈8 hours across 3 days, reusing the same lessons and assessment records as the 14-day course."]);
    await db.run("INSERT OR IGNORE INTO courses (id,track_id,title) VALUES (?,?,?)", [courseId, trackId, "CGS ORIS Field Service Academy"]);
    const lessons = [...LESSONS_A, ...LESSONS_B].sort((a, b) => a.day - b.day);
    for (const l of lessons) {
      const modId = `mod-${l.day}`, lesId = `les-${l.day}`;
      await db.run("INSERT OR IGNORE INTO modules (id,course_id,title,sort) VALUES (?,?,?,?)", [modId, courseId, `Day ${l.day}`, l.day]);
      await db.run("INSERT OR IGNORE INTO lessons (id,module_id,day,slug,title,summary,minutes,competency,objectives,prerequisites,field_example,summary_review,sources,confidence) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [lesId, modId, l.day, l.slug, l.title, l.summary, l.minutes, l.competency, JSON.stringify(l.objectives), l.prerequisites, l.fieldExample, l.summaryReview, l.sources, l.confidence]);
      for (let i = 0; i < l.sections.length; i++) await db.run("INSERT INTO lesson_content_blocks (id,lesson_id,sort,heading,body) VALUES (?,?,?,?,?)", [id(), lesId, i, l.sections[i].heading, l.sections[i].body]);
      for (let i = 0; i < l.quiz.length; i++) { const qu = l.quiz[i]; await db.run("INSERT INTO quiz_questions (id,lesson_id,sort,prompt,choices,answer,explanation,review_hint,competency) VALUES (?,?,?,?,?,?,?,?,?)", [id(), lesId, i, qu.prompt, JSON.stringify(qu.choices), qu.answer, qu.explanation, qu.reviewHint, l.competency]); }
    }
    for (let i = 0; i < FLASHCARDS.length; i++) await db.run("INSERT INTO flashcards (id,term,definition,category) VALUES (?,?,?,?)", [`card-${i}`, FLASHCARDS[i][0], FLASHCARDS[i][1], FLASHCARDS[i][2]]);
    for (let i = 0; i < INTERVIEW.length; i++) await db.run("INSERT INTO interview_questions (id,category,prompt,follow_up,model_answer,sort) VALUES (?,?,?,?,?,?)", [`iq-${i}`, INTERVIEW[i].category, INTERVIEW[i].prompt, INTERVIEW[i].followUp, INTERVIEW[i].model, i]);
    for (const s of SCENARIOS) {
      const sid = `scn-${s.slug}`;
      await db.run("INSERT OR IGNORE INTO troubleshooting_scenarios (id,slug,title,complaint,context,competency,difficulty) VALUES (?,?,?,?,?,?,?)", [sid, s.slug, s.title, s.complaint, s.context, s.competency, s.difficulty]);
      for (const [key, node] of Object.entries(s.nodes)) {
        const nid = `${sid}-${key}`;
        await db.run("INSERT OR IGNORE INTO scenario_nodes (id,scenario_id,node_key,kind,title,body) VALUES (?,?,?,?,?,?)", [nid, sid, key, node.kind, node.title, node.body]);
        for (let i = 0; i < node.choices.length; i++) { const c = node.choices[i]; await db.run("INSERT INTO scenario_choices (id,node_id,sort,label,next_key,effects,reveal) VALUES (?,?,?,?,?,?,?)", [id(), nid, i, c.label, c.next, JSON.stringify(c.effects), c.reveal]); }
      }
    }
    const refs: [string, string, string][] = [
      ["OSHA Lockout/Tagout standard, 29 CFR 1910.147", "Regulation (principles)", "Energy control: isolate, lock/tag, release stored energy, verify. E-stop is not isolation."],
      ["ICC color management concepts (International Color Consortium)", "Industry reference", "Profiles, Lab connection space, calibration vs characterization at a conceptual level."],
      ["CIE Lab / Delta E color-difference definitions", "Industry reference", "Delta E computed from measured Lab values; smaller = closer."],
      ["CGS ORIS / METIS / Platinum Technologies public product pages", "Manufacturer public info", "Product-family purposes only; model-specific specifications not asserted."],
      ["Supplied conceptual diagrams (workflow, printer architecture, troubleshooting tree)", "Course reference", "Rebuilt as interactive educational models; not OEM schematics."],
    ];
    for (let i = 0; i < refs.length; i++) await db.run("INSERT INTO source_references (id,title,kind,note) VALUES (?,?,?,?)", [`ref-${i}`, refs[i][0], refs[i][1], refs[i][2]]);
  }
  const users = await db.q("SELECT id FROM users LIMIT 1");
  if (!users.length) {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@academy.local";
    await db.run("INSERT INTO users (id,email,name,password_hash,role,track,created_at) VALUES (?,?,?,?,?,?,?)", [id(), adminEmail, "Academy Admin", await bcrypt.hash("admin12345", 10), "admin", "course14", new Date().toISOString()]);
    await db.run("INSERT INTO users (id,email,name,password_hash,role,track,created_at) VALUES (?,?,?,?,?,?,?)", [id(), "learner@academy.local", "Demo Learner", await bcrypt.hash("learner12345", 10), "learner", "course14", new Date().toISOString()]);
  }
}
