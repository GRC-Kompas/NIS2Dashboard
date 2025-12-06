import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'consultant') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const organisations = await prisma.organisation.findMany({
    include: {
      risk_scores: {
        orderBy: { calculated_at: 'desc' },
        take: 1,
        select: { overall_score: true, calculated_at: true },
      },
    },
  });

  const response = organisations.map(org => ({
    id: org.id,
    name: org.name,
    nis2_segment: org.nis2_segment,
    overall_score: org.risk_scores[0]?.overall_score ?? null,
    updated_at: org.risk_scores[0]?.calculated_at ?? org.updated_at,
  }));

  return NextResponse.json(response);
}
