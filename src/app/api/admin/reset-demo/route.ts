import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { seedDemoData } from '@/lib/seed-logic';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'consultant') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  // Check demo mode env var
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      return NextResponse.json({ message: 'Demo mode not enabled' }, { status: 400 });
  }

  try {
      await seedDemoData(prisma);
      await logAudit({
          organisationId: 'system', // or null if schema allows
          userId: session.userId,
          action: 'DEMO_RESET',
          details: { initiatedBy: session.email }
      });
      return NextResponse.json({ message: 'Demo data reset successfully' });
  } catch (e) {
      console.error(e);
      return NextResponse.json({ message: 'Failed to reset demo data' }, { status: 500 });
  }
}
