import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const customerAllowedPaths = [
  '/dashboard',
  '/dashboard/agent',
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

  // Allow public access to the agent dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard/agent')) {
    return NextResponse.next();
  }

  if (!accessToken && !refreshToken) {
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (userRole === 'customer') {
    const isAllowed = customerAllowedPaths.some(path =>
      request.nextUrl.pathname.startsWith(path)
    );
    if (!isAllowed && request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
