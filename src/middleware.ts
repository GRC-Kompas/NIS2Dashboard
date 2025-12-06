import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession();

  // Minimal middleware to protect dashboard routes
  // For API routes, we will handle auth checks inside the handlers for granular control

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!session) {
          return NextResponse.redirect(new URL('/login', request.url));
      }
      // Can add more checks here (e.g. client accessing wrong org dashboard)
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/organisations/:path*', '/api/actions/:path*'],
};
