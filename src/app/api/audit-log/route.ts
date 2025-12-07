import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Audit logs are sensitive, Consultant only
  if (session.role !== 'consultant') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { created_at: 'desc' },
    take: 100,
    include: {
        organisation: { select: { name: true } },
        user: { select: { email: true } }
    }
  });

  return NextResponse.json(logs);
}
