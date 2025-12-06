import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // RBAC: Consultant can see all. Client can only see their own.
  if (session.role === 'client' && session.organisationId !== id) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const organisation = await prisma.organisation.findUnique({
    where: { id },
    include: {
      risk_scores: {
        orderBy: { calculated_at: 'desc' },
        take: 1,
      },
    },
  });

  if (!organisation) {
    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
  }

  return NextResponse.json(organisation);
}
