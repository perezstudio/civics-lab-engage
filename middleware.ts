import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not /sign-in,
  // redirect the user to /sign-in
  if (!session && req.nextUrl.pathname !== '/sign-in') {
    const redirectUrl = new URL('/sign-in', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and the current path is /sign-in,
  // redirect the user to /app/engage
  if (session && req.nextUrl.pathname === '/sign-in') {
    const redirectUrl = new URL('/app/engage', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
