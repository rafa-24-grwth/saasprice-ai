// lib/supabase/auth-client.ts
// CLIENT-SIDE ONLY - Used in components and hooks

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Browser/Client Component Supabase Client
// Uses @supabase/ssr for cookie-based session storage
export const createBrowserClient = () => {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}