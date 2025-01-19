import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session and trying to access protected routes
  if (!session) {
    if (req.nextUrl.pathname.startsWith('/app') || 
        req.nextUrl.pathname === '/workspace-setup') {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }

  // If session exists but no workspace, redirect to workspace setup
  // (except if already on workspace-setup)
  if (session && req.nextUrl.pathname.startsWith('/app')) {
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('selected_workspace_id')
      .single()

    if (!userSettings?.selected_workspace_id && 
        req.nextUrl.pathname !== '/workspace-setup') {
      return NextResponse.redirect(new URL('/workspace-setup', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
