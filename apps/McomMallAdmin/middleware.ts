import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const customerAllowedPaths = [
  '/dashboard',
  '/dashboard/my-bookings',
  '/dashboard/messages',
  '/dashboard/wallet',
  '/dashboard/my-wishlist',
  '/dashboard/reviews',
  '/dashboard/bookmarks',
  '/dashboard/my-profile',
  '/dashboard/my-subscription',
];

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access')?.value;
  const refreshToken = request.cookies.get('refresh')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;

  // Protect both /dashboard and /admin routes if user is not logged in
  if (!accessToken && !refreshToken) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'admin') {
      // Redirect non-admins away from admin pages
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Existing customer route protection
  if (userRole === 'customer') {
    const isAllowed = customerAllowedPaths.some(path =>
      pathname.startsWith(path)
    );
    if (!isAllowed && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
