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
    if (process.env.NODE_ENV === 'production') {
      console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Using placeholders for build.');
    }
    // Fallback for build process to prevent crash
    return createBrowserClient<Database>(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key'
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Optional: Export with a more explicit name
export const createBrowserSupabaseClient = createClient;