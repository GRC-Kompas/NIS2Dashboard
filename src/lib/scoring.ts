// Scoring Engine based on RISK_SCORING.md

export type AnswerType = "Yes" | "No" | "Not Sure";
export type Category = "governance" | "risk_management" | "incident" | "suppliers";

export interface QuestionDef {
  id: string;
  category: Category;
  weight: number; // 1 (standard) to 3 (critical)
}

// Minimal question definitions based on context (this would typically come from a DB or config)
// For MVP, we can define a small set here or accept it as argument.
export const QUESTIONS: QuestionDef[] = [
    // Governance
    { id: 'q_gov_1', category: 'governance', weight: 3 }, // Critical
    { id: 'q_gov_2', category: 'governance', weight: 1 },
    // Risk Management
    { id: 'q_risk_1', category: 'risk_management', weight: 2 },
    { id: 'q_risk_2', category: 'risk_management', weight: 2 },
    // Incident
    { id: 'q_inc_1', category: 'incident', weight: 3 },
    { id: 'q_inc_2', category: 'incident', weight: 1 },
    // Suppliers
    { id: 'q_sup_1', category: 'suppliers', weight: 2 },
    { id: 'q_sup_2', category: 'suppliers', weight: 1 },
];

export interface ScoreResult {
    governance_score: number;
    risk_management_score: number;
    incident_score: number;
    suppliers_score: number;
    overall_score: number;
    method_version: string;
}

export function calculateRiskScore(answers: Record<string, AnswerType>, questions: QuestionDef[] = QUESTIONS): ScoreResult {
    // Initialize accumulators
    const scores = {
      governance: { earned: 0, total: 0 },
      risk_management: { earned: 0, total: 0 },
      incident: { earned: 0, total: 0 },
      suppliers: { earned: 0, total: 0 },
    };

    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      const maxPoints = q.weight * 100; // Max score for this question
      let earnedPoints = 0;

      if (userAnswer === "Yes") {
        earnedPoints = maxPoints;
      }
      // "No" and "Not Sure" result in 0 points

      // Add to category buckets
      if (scores[q.category]) {
        scores[q.category].earned += earnedPoints;
        scores[q.category].total += maxPoints;
      }
    });

    // Helper to calculate percentage
    const calcPct = (earned: number, total: number) => total === 0 ? 0 : Math.round((earned / total) * 100);

    const finalScores = {
      governance_score: calcPct(scores.governance.earned, scores.governance.total),
      risk_management_score: calcPct(scores.risk_management.earned, scores.risk_management.total),
      incident_score: calcPct(scores.incident.earned, scores.incident.total),
      suppliers_score: calcPct(scores.suppliers.earned, scores.suppliers.total),
    };

    // Overall score: Plain average of the four categories
    const overall_score = Math.round(
      (finalScores.governance_score +
       finalScores.risk_management_score +
       finalScores.incident_score +
       finalScores.suppliers_score) / 4
    );

    return { ...finalScores, overall_score, method_version: 'v1.0' };
  }
