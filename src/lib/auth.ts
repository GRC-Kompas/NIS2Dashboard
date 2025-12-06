import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import prisma from './db';

const SECRET_KEY = process.env.NEXTAUTH_SECRET || 'secret';
const key = new TextEncoder().encode(SECRET_KEY);

export interface SessionPayload {
  userId: string;
  email: string;
  role: 'consultant' | 'client';
  organisationId: string | null;
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as unknown as SessionPayload;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch (error) {
    return null;
  }
}

export async function login(userId: string, email: string, role: string, organisationId: string | null) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = await encrypt({ userId, email, role: role as 'consultant' | 'client', organisationId });
  const cookieStore = await cookies();

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    sameSite: 'lax',
    path: '/',
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', { expires: new Date(0) });
}
