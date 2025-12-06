import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // If consultant, fetch all actions (maybe filtered by status open by default?)
  // If client, fetch only their org's actions.

  const where: any = {};
  if (session.role === 'client') {
      where.organisation_id = session.organisationId;
  }

  // Optional: filter by status from query param
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  if (status) {
      where.status = status;
  }

  const actions = await prisma.improvementAction.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: {
        organisation: {
            select: { name: true }
        }
    }
  });

  return NextResponse.json(actions);
}
