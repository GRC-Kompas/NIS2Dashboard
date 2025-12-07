import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import { logAudit } from '@/lib/audit';

const incidentSchema = z.object({
  type: z.string().min(1),
  impact: z.string().min(1),
  discovered_at: z.string(), // ISO date string
  initial_actions: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // RBAC: Consultant or Client (Owner)
  if (session.role === 'client' && session.organisationId !== id) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = incidentSchema.parse(body);

    const incident = await prisma.incident.create({
      data: {
        organisation_id: id,
        type: data.type,
        impact: data.impact,
        discovered_at: new Date(data.discovered_at),
        initial_actions: data.initial_actions,
        contact_name: data.contact_name,
        contact_email: data.contact_email,
      },
    });

    await logAudit({
        organisationId: id,
        userId: session.userId,
        action: 'INCIDENT_CREATED',
        details: { incidentId: incident.id, type: incident.type }
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', details: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
