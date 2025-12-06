import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (session.role === 'client' && session.organisationId !== id) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const riskScore = await prisma.riskScore.findFirst({
    where: { organisation_id: id },
    orderBy: { calculated_at: 'desc' },
  });

  if (!riskScore) {
    return NextResponse.json({ message: 'No risk score found' }, { status: 404 });
  }

  return NextResponse.json(riskScore);
}
