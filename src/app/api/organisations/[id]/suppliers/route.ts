import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import { logAudit } from '@/lib/audit';

const supplierSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  contact_email: z.string().email().optional(),
  risk_level: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  status: z.enum(['Geen vragenlijst', 'Vragenlijst verstuurd', 'Beoordeeld']).default('Geen vragenlijst'),
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

    const suppliers = await prisma.supplier.findMany({
      where: { organisation_id: id },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(suppliers);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (session.role === 'client' && session.organisationId !== id) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = supplierSchema.parse(body);

    const supplier = await prisma.supplier.create({
      data: {
        organisation_id: id,
        ...data,
      },
    });

    await logAudit({
        organisationId: id,
        userId: session.userId,
        action: 'SUPPLIER_CREATED',
        details: { supplierId: supplier.id, name: supplier.name }
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', details: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
