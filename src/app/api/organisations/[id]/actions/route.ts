import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const createActionSchema = z.object({
  title: z.string().min(1),
  category: z.enum(['governance', 'risk_management', 'incident', 'suppliers', 'other']),
  priority: z.enum(['high', 'medium', 'low']),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (session.role === 'client' && session.organisationId !== id) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const where: any = { organisation_id: id };
  if (status) {
      where.status = status;
  }

  const actions = await prisma.improvementAction.findMany({
    where,
    orderBy: { created_at: 'desc' },
  });

  return NextResponse.json(actions);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only consultant can create manual actions
    if (session.role !== 'consultant') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const data = createActionSchema.parse(body);

        const action = await prisma.improvementAction.create({
            data: {
                organisation_id: id,
                ...data,
                status: 'open'
            }
        });

        return NextResponse.json(action, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json({ message: 'Invalid input', details: (error as any).errors }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
