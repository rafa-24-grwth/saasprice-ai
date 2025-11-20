// lib/supabase/auth.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import type { User, Session } from '@supabase/supabase-js'

// EXPLICIT NAMING - No ambiguity about which environment each client is for

// Browser/Client Component Supabase Client
export const createBrowserClient = () => {
  return createClientComponentClient<Database>()
}

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