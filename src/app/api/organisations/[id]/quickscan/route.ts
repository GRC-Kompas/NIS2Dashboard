import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import { calculateRiskScore, AnswerType, QUESTIONS } from '@/lib/scoring';

const quickscanSchema = z.object({
  source: z.string().default('manual'),
  answers: z.record(z.string(), z.enum(['Yes', 'No', 'Not Sure'])),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // RBAC: Consultant or Owner can submit
  if (session.role === 'client' && session.organisationId !== id) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { source, answers } = quickscanSchema.parse(body);

    // 1. Save Quickscan Result
    const quickscan = await prisma.quickscanResult.create({
      data: {
        organisation_id: id,
        raw_answers: JSON.stringify(answers), // Ensure JSON format for SQLite (and Postgres handles JSONB from string too if needed)
        source,
      },
    });

    // 2. Calculate Score
    const scoreResult = calculateRiskScore(answers as Record<string, AnswerType>, QUESTIONS);

    // 3. Save Risk Score
    const riskScore = await prisma.riskScore.create({
      data: {
        organisation_id: id,
        overall_score: scoreResult.overall_score,
        governance_score: scoreResult.governance_score,
        risk_management_score: scoreResult.risk_management_score,
        incident_score: scoreResult.incident_score,
        suppliers_score: scoreResult.suppliers_score,
        method_version: scoreResult.method_version,
      },
    });

    // 4. (Stub) Create Improvement Actions if score is low
    // In a real app, this would check specific gaps.
    if (scoreResult.overall_score < 50) {
        await prisma.improvementAction.create({
            data: {
                organisation_id: id,
                title: 'Review NIS2 Gaps based on recent Quickscan',
                category: 'governance',
                priority: 'high',
                status: 'open'
            }
        });
    }

    return NextResponse.json({
        message: 'Quickscan submitted and scored',
        quickscanId: quickscan.id,
        riskScoreId: riskScore.id
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', details: (error as any).errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
