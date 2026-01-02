import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const storageMode = request.cookies.get('storage-mode');
  const pathname = request.nextUrl.pathname;

  // If no mode and not on setup page, redirect to setup
  if (!storageMode && !pathname.startsWith('/setup')) {
    return NextResponse.redirect(new URL('/setup', request.url));
  }

  // If mode set and on setup, redirect to dashboard
  if (storageMode && pathname.startsWith('/setup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If mode set and on root, redirect to dashboard
  if (storageMode && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
