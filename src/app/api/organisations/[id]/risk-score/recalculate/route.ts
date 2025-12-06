import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { calculateRiskScore, QUESTIONS, AnswerType } from '@/lib/scoring';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Recalculate is Consultant only
  if (session.role !== 'consultant') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  // Get latest quickscan
  const latestQuickscan = await prisma.quickscanResult.findFirst({
    where: { organisation_id: id },
    orderBy: { submitted_at: 'desc' },
  });

  if (!latestQuickscan) {
      return NextResponse.json({ message: 'No quickscan found to recalculate' }, { status: 404 });
  }

  // Parse answers (handle string or object for Json type compat)
  let answers = latestQuickscan.raw_answers;
  if (typeof answers === 'string') {
      try {
          answers = JSON.parse(answers);
      } catch (e) {
          return NextResponse.json({ message: 'Failed to parse raw answers' }, { status: 500 });
      }
  }

  // Recalculate
  const scoreResult = calculateRiskScore(answers as unknown as Record<string, AnswerType>, QUESTIONS);

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

  return NextResponse.json(riskScore);
}
