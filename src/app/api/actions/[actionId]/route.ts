import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const updateActionSchema = z.object({
  status: z.enum(['open', 'in_progress', 'done']),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ actionId: string }> }) {
  const session = await getSession();
  const { actionId } = await params;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status } = updateActionSchema.parse(body);

    const action = await prisma.improvementAction.findUnique({
      where: { id: actionId },
    });

    if (!action) {
      return NextResponse.json({ message: 'Action not found' }, { status: 404 });
    }

    // RBAC: Consultant can update any action. Client can only update actions for their own org.
    if (session.role === 'client' && session.organisationId !== action.organisation_id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const updatedAction = await prisma.improvementAction.update({
      where: { id: actionId },
      data: { status },
    });

    // Audit Log (console for MVP)
    console.log(JSON.stringify({
        level: 'info',
        event: 'audit',
        action: 'UPDATE_ACTION_STATUS',
        user_id: session.userId,
        organisation_id: updatedAction.organisation_id,
        action_id: updatedAction.id,
        new_status: status,
        timestamp: new Date().toISOString()
    }));

    return NextResponse.json(updatedAction);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', details: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
