import { describe, it, expect } from "vitest";
import { masteryFromEvidence, recommendNext, applyEffects, emptyScores, scenarioGrade, ruleBasedFeedback, STUDY_WEIGHTS } from "@/lib/scoring";
describe("competency model", () => {
  it("mastery is evidence-based (0 with no evidence)", () => { expect(masteryFromEvidence({ passed: 0, total: 0 })).toBe(0); expect(masteryFromEvidence({ passed: 3, total: 4 })).toBe(75); });
  it("study weights sum to 100 and are distinct from mastery", () => { expect(Object.values(STUDY_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100); });
  it("recommends weakest incomplete lesson first", () => { const r = recommendNext({ mastery: { A: 80, B: 10 }, evidence: { A: 5, B: 5 }, incompleteLessons: [{ slug: "a", title: "A", competency: "A" }, { slug: "b", title: "B", competency: "B" }] }); expect(r?.slug).toBe("b"); });
});
describe("scenario scoring", () => {
  it("applies effects with clamping", () => { const s = applyEffects(emptyScores(), { evidence: 15, safety: -30 }); expect(s.evidence).toBe(15); expect(s.safety).toBe(-20); });
  it("flags unsafe runs in the grade label", () => { const g = scenarioGrade({ ...emptyScores(), safety: -5 }); expect(g.label).toContain("Unsafe"); });
  it("grades a thorough verified run as competent+", () => { const g = scenarioGrade({ safety: 25, evidence: 30, hypothesis: 15, leastInvasive: 25, interpretation: 15, verification: 30, documentation: 10, communication: 20 }); expect(g.total).toBe(100); expect(g.label).toBe("Field-ready"); });
});
describe("rule-based interview feedback (not AI)", () => {
  it("flags missing safety and verification language", () => { const tips = ruleBasedFeedback("I fixed it quickly for the customer.", {}); expect(tips.join(" ")).toMatch(/safety/i); expect(tips.join(" ")).toMatch(/verif/i); });
  it("recognizes a complete structured answer", () => { const tips = ruleBasedFeedback("First I assessed safety and applied PPE and lockout where authorized. I gathered evidence, ran a nozzle check, verified with a test print and measurement, documented everything in the service ticket, and explained the result to the customer.", {}); expect(tips.join(" ")).toMatch(/Strong structure/); });
});
