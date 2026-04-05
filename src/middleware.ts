import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })

  // App layouts handle auth and onboarding. Keep middleware lightweight to
  // avoid edge timeouts from network-bound auth refreshes on every request.
  response.headers.set('x-pathname', request.nextUrl.pathname)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
