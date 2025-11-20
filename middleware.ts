// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Refresh session if expired
  const { data: { session }, error } = await supabase.auth.getSession()
  
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                     req.nextUrl.pathname.startsWith('/signup') ||
                     req.nextUrl.pathname.startsWith('/forgot-password') ||
                     req.nextUrl.pathname.startsWith('/reset-password')
  
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') ||
                           req.nextUrl.pathname.startsWith('/vendors') ||
                           req.nextUrl.pathname.startsWith('/compare') ||
                           req.nextUrl.pathname.startsWith('/settings') ||
                           req.nextUrl.pathname.startsWith('/profile')
  
  const isPublicRoute = req.nextUrl.pathname === '/' ||
                        req.nextUrl.pathname.startsWith('/terms') ||
                        req.nextUrl.pathname.startsWith('/privacy') ||
                        req.nextUrl.pathname.startsWith('/auth/callback')
  
  // If user is on auth page but already logged in, redirect to dashboard
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  // If user is on protected route but not logged in, redirect to login
  if (isProtectedRoute && !session) {
    // Store the intended destination
    const redirectTo = req.nextUrl.pathname + req.nextUrl.search
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirectTo', redirectTo)
    return NextResponse.redirect(loginUrl)
  }
  
  // For all other cases, continue with the request
  return res
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (we handle auth separately in API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}