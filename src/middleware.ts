import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE_NAME, ADMIN_LOGIN_PATH } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all routes under /admin/dashboard
  if (pathname.startsWith('/admin/dashboard')) {
    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE_NAME);
    
    // In a real app, you'd verify the cookie's value (e.g., a JWT)
    if (!sessionCookie || sessionCookie.value !== 'loggedIn') {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      loginUrl.searchParams.set('redirect', pathname); // Optional: redirect back after login
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*'], // Apply middleware to all paths under /admin/dashboard
};
