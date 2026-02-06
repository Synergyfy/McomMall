import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const provisionCodeParam = request.nextUrl.searchParams.get('provisionCode')
  const provisionCodeHeader = request.headers.get('provisionCode')

  const provisionCode = provisionCodeParam || provisionCodeHeader

  if (provisionCode) {
    response.cookies.set({
      name: 'provisionCode',
      value: provisionCode,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: false, // Allow client-side access via js-cookie
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
