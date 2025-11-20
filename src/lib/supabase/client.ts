// /lib/supabase/client.ts
// THIS FILE IS FOR CLIENT-SIDE OPERATIONS ONLY
// Uses ANON KEY with limited permissions

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

// This can be safely used in browser/client components
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Please check your .env.local file.'
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Optional: Export with a more explicit name
export const createBrowserSupabaseClient = createClient;