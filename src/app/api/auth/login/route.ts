import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { login } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    await login(user.id, user.email, user.role, user.organisation_id);

    return NextResponse.json({
        message: 'Logged in successfully',
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            organisation_id: user.organisation_id
        }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', details: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
