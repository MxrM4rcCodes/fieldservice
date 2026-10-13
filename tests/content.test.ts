import { describe, it, expect } from "vitest";
import { LESSONS_A } from "@/lib/content/lessons-a";
import { LESSONS_B } from "@/lib/content/lessons-b";
import { SCENARIOS } from "@/lib/content/scenarios";
import { FLASHCARDS } from "@/lib/content/flashcards";
const LESSONS = [...LESSONS_A, ...LESSONS_B];
describe("content integrity (Acceptance Test 8)", () => {
  it("has exactly 14 days, each with 3+ sections and 5+ explained questions", () => {
    expect(LESSONS.map(l => l.day).sort((a, b) => a - b)).toEqual([1,2,3,4,5,6,7,8,9,10,11,12,13,14]);
    for (const l of LESSONS) { expect(l.sections.length).toBeGreaterThanOrEqual(3); expect(l.quiz.length).toBeGreaterThanOrEqual(5); for (const qu of l.quiz) { expect(qu.choices[qu.answer]).toBeTruthy(); expect(qu.explanation.length).toBeGreaterThan(20); } expect(l.fieldExample.length).toBeGreaterThan(40); }
  });
  it("has at least 60 flashcards", () => { expect(FLASHCARDS.length).toBeGreaterThanOrEqual(60); });
  it("has all 10 required scenarios, each reachable to an end node", () => {
    expect(SCENARIOS.length).toBe(10);
    for (const s of SCENARIOS) {
      const seen = new Set<string>(); const queue = [s.start];
      while (queue.length) { const k = queue.pop()!; if (seen.has(k)) continue; seen.add(k); const node = s.nodes[k]; expect(node, `${s.slug}:${k}`).toBeTruthy(); for (const c of node.choices) { expect(s.nodes[c.next], `${s.slug} -> ${c.next}`).toBeTruthy(); queue.push(c.next); } }
      expect([...seen].some(k => s.nodes[k].kind === "end"), s.slug).toBe(true);
    }
  });
  it("scenario 10 contains an unsafe branch that does not succeed", () => { const s = SCENARIOS.find(x => x.slug.includes("unsafe"))!; expect(Object.values(s.nodes).some(n => n.kind === "end" && /unsafe action/i.test(n.title))).toBe(true); });
});
