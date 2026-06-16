import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If user is already authenticated and tries to access login page, redirect away
  if (pathname === '/auth/login') {
    const token = await getToken({ req: request });
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protected routes
  if (pathname.startsWith('/organizer')) {
    const token = await getToken({ req: request });
    if (!token || token.role !== 'organizer') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  if (pathname.startsWith('/candidate')) {
    const token = await getToken({ req: request });
    if (!token || token.role !== 'candidate') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  if (pathname.includes('/attempt') && pathname.startsWith('/quiz')) {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match only the login page, exclude API routes and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};