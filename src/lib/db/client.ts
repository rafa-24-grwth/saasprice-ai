/**
 * Supabase client configuration
 */

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database'; // We'll generate this type file later

// Client-side Supabase client (uses anon key)
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// For server-side operations, we'll create a separate service client
// This will be in a server-only file