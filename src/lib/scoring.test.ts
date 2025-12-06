import { calculateRiskScore, QuestionDef, AnswerType } from './scoring';

const mockQuestions: QuestionDef[] = [
    { id: 'q1', category: 'governance', weight: 1 },
    { id: 'q2', category: 'governance', weight: 1 },
    { id: 'q3', category: 'risk_management', weight: 1 },
    { id: 'q4', category: 'risk_management', weight: 1 },
    { id: 'q5', category: 'incident', weight: 1 },
    { id: 'q6', category: 'incident', weight: 1 },
    { id: 'q7', category: 'suppliers', weight: 1 },
    { id: 'q8', category: 'suppliers', weight: 1 },
];

describe('Risk Scoring Engine', () => {
    test('Calculates 100% score when all answers are Yes', () => {
        const answers: Record<string, AnswerType> = {
            q1: 'Yes', q2: 'Yes',
            q3: 'Yes', q4: 'Yes',
            q5: 'Yes', q6: 'Yes',
            q7: 'Yes', q8: 'Yes',
        };

        const score = calculateRiskScore(answers, mockQuestions);

        expect(score.governance_score).toBe(100);
        expect(score.risk_management_score).toBe(100);
        expect(score.incident_score).toBe(100);
        expect(score.suppliers_score).toBe(100);
        expect(score.overall_score).toBe(100);
    });

    test('Calculates 0% score when all answers are No', () => {
        const answers: Record<string, AnswerType> = {
            q1: 'No', q2: 'No',
            q3: 'No', q4: 'No',
            q5: 'No', q6: 'No',
            q7: 'No', q8: 'No',
        };

        const score = calculateRiskScore(answers, mockQuestions);

        expect(score.overall_score).toBe(0);
    });

    test('Calculates 50% correctly', () => {
        const answers: Record<string, AnswerType> = {
            q1: 'Yes', q2: 'No', // 50%
            q3: 'Yes', q4: 'No', // 50%
            q5: 'Yes', q6: 'No', // 50%
            q7: 'Yes', q8: 'No', // 50%
        };

        const score = calculateRiskScore(answers, mockQuestions);
        expect(score.overall_score).toBe(50);
    });

    test('Weighted calculation works', () => {
        const weightedQuestions: QuestionDef[] = [
            { id: 'w1', category: 'governance', weight: 3 }, // 75% of points
            { id: 'w2', category: 'governance', weight: 1 }, // 25% of points
            // other cats dummy
            { id: 'd1', category: 'risk_management', weight: 1 },
            { id: 'd2', category: 'incident', weight: 1 },
            { id: 'd3', category: 'suppliers', weight: 1 },
        ];

        // w1 is Yes (3 points), w2 is No (0 points). Total possible = 4. Earned = 3. 3/4 = 75%.
        const answers: Record<string, AnswerType> = {
            w1: 'Yes', w2: 'No',
            d1: 'No', d2: 'No', d3: 'No'
        };

        const score = calculateRiskScore(answers, weightedQuestions);
        expect(score.governance_score).toBe(75);
    });

    test('Empty answers result in 0', () => {
        const score = calculateRiskScore({}, mockQuestions);
        expect(score.overall_score).toBe(0);
    });

    test('Handles "Not Sure" as 0 points', () => {
         const answers: Record<string, AnswerType> = {
            q1: 'Not Sure', q2: 'No',
            q3: 'Not Sure', q4: 'No',
            q5: 'Not Sure', q6: 'No',
            q7: 'Not Sure', q8: 'No',
        };
        const score = calculateRiskScore(answers, mockQuestions);
        expect(score.overall_score).toBe(0);
    });
});
