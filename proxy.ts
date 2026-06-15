import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Protected organizer routes
  if (pathname.startsWith('/organizer') && (!token || token.role !== 'organizer')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Protected candidate routes
  if (pathname.startsWith('/candidate') && (!token || token.role !== 'candidate')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Protected quiz attempt route
  if (pathname.includes('/attempt') && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/organizer/:path*', '/candidate/:path*', '/quiz/:path*/attempt'],
};
