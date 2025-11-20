// lib/supabase/auth-server.ts
// SERVER-SIDE ONLY - Used in Server Components and Route Handlers

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import type { User, Session } from '@supabase/supabase-js'

// Server Component Supabase Client - SYNCHRONOUS
export const createServerComponentAuthClient = () => {
  return createServerComponentClient<Database>({ 
    cookies 
  })
}

// Route Handler Supabase Client - SYNCHRONOUS  
export const createRouteHandlerAuthClient = () => {
  return createRouteHandlerClient<Database>({ 
    cookies 
  })
}

// Profile type for when we add the profiles table
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  subscription_tier: 'free' | 'pro' | 'enterprise'
  created_at: string
  updated_at: string
}

// Auth helper functions using proper Supabase types
export const getUser = async (): Promise<{ user: User | null; error: any }> => {
  const supabase = createServerComponentAuthClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const getSession = async (): Promise<{ session: Session | null; error: any }> => {
  const supabase = createServerComponentAuthClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { user } = await getUser()
  return !!user
}

// Protect a server action or API route
export const requireAuth = async (): Promise<User> => {
  const { user, error } = await getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized - Please login')
  }
  
  return user
}