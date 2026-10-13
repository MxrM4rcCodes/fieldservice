// Competency model (spec §6). Weights are STUDY PRIORITIES, shown separately from observed mastery.
export const COMPETENCIES = ["Hardware, Diagnostics & Safety", "Color Science & ORIS", "METIS Scanning", "Customer Support & Documentation", "Company & Interview Knowledge"] as const;
export const STUDY_WEIGHTS: Record<string, number> = { "Hardware, Diagnostics & Safety": 35, "Color Science & ORIS": 25, "METIS Scanning": 15, "Customer Support & Documentation": 15, "Company & Interview Knowledge": 10 };

/** Mastery is evidence-based only: quiz attempts, scenario completions, flashcard reviews. No invented progress. */
export function masteryFromEvidence(evidence: { passed: number; total: number }): number {
  if (evidence.total <= 0) return 0;
  return Math.round((evidence.passed / evidence.total) * 100);
}

/** Adaptive recommendation: weakest competency with evidence gaps first, then least-recently-studied lesson. */
export function recommendNext(input: { mastery: Record<string, number>; evidence: Record<string, number>; incompleteLessons: { slug: string; title: string; competency: string }[] }) {
  const ranked = [...input.incompleteLessons].sort((a, b) => {
    const ma = input.mastery[a.competency] ?? 0, mb = input.mastery[b.competency] ?? 0;
    const ea = input.evidence[a.competency] ?? 0, eb = input.evidence[b.competency] ?? 0;
    if (ma !== mb) return ma - mb;
    return ea - eb;
  });
  return ranked[0] ?? null;
}

export type ScenarioScores = { safety: number; evidence: number; hypothesis: number; leastInvasive: number; interpretation: number; verification: number; documentation: number; communication: number };
export const emptyScores = (): ScenarioScores => ({ safety: 0, evidence: 0, hypothesis: 0, leastInvasive: 0, interpretation: 0, verification: 0, documentation: 0, communication: 0 });
export function applyEffects(scores: ScenarioScores, effects: Partial<ScenarioScores>): ScenarioScores {
  const out = { ...scores };
  (Object.keys(out) as (keyof ScenarioScores)[]).forEach(k => { out[k] = Math.max(-20, Math.min(100, out[k] + (effects[k] ?? 0))); });
  return out;
}
export function scenarioGrade(scores: ScenarioScores): { total: number; label: string } {
  // Points model: each good decision earns points across the 8 rubric dimensions; the run total is the
  // capped sum (a thorough, safe, verified run earns ~90-130 raw points). Unsafe safety score overrides.
  const total = Math.max(0, Math.min(100, Math.round(Object.values(scores).reduce((a, b) => a + b, 0))));
  const label = scores.safety < 0 ? "Unsafe — review safety before continuing" : total >= 70 ? "Field-ready" : total >= 45 ? "Competent with coaching" : total >= 25 ? "Developing" : "Needs guided practice";
  return { total, label };
}
/** Rule-based interview feedback (NOT AI). Transparent rubric feedback from observable response features. */
export function ruleBasedFeedback(response: string, self: Record<string, number>): string[] {
  const tips: string[] = [];
  const text = response.toLowerCase();
  if (response.trim().length < 120) tips.push("Expand the answer: field interviewers listen for a complete situation → task → action → result flow.");
  if (!/(safety|lockout|tagout|ppe|interlock|e-?stop|hazard)/.test(text)) tips.push("Add a safety step (hazard assessment, PPE, energy isolation where applicable) before describing hands-on work.");
  if (!/(verif|test print|measure|confirm|check)/.test(text)) tips.push("Close with verification: how you proved the fix worked (test print, measurement, or monitored run).");
  if (!/(document|ticket|note|record|report)/.test(text)) tips.push("Mention documentation: what you would record in the service ticket for the next technician.");
  if (!/(customer|client|explain|update|communicat)/.test(text)) tips.push("Add customer communication: what you told the customer, in plain language, and when.");
  if (self["Safety awareness"] !== undefined && self["Safety awareness"] <= 2) tips.push("Your self-score flags safety awareness — review Day 3 (Equipment Safety) before the mock interview.");
  if (tips.length === 0) tips.push("Strong structure: safety, evidence, verification, documentation, and customer communication are all present. Add one measurable detail (e.g. a Delta E value or a nozzle-check result) to make it concrete.");
  return tips;
}

export const RUBRIC = ["Technical reasoning", "Safety awareness", "Customer communication", "Verification and documentation", "Clarity"];
