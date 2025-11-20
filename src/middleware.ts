// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Simple in-memory rate limiter (consider Redis for production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    
    // Different limits for different endpoints
    let limit = 60; // default
    if (request.nextUrl.pathname.includes('/vendors')) {
      limit = 30; // stricter for vendor data
    }
    
    const current = rateLimit.get(ip);
    
    if (!current || current.resetTime < now) {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    } else if (current.count >= limit) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests, please try again later' }), 
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
          }
        }
      );
    } else {
      current.count++;
    }
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      const cutoff = now - windowMs * 2;
      for (const [key, value] of rateLimit.entries()) {
        if (value.resetTime < cutoff) {
          rateLimit.delete(key);
        }
      }
    }
  }

  // Supabase auth handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};