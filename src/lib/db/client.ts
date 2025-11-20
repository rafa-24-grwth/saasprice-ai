/**
 * Supabase client configuration
 */

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database'; // We'll generate this type file later

// Client-side Supabase client (uses anon key)
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

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );
}

// For server-side operations, we'll create a separate service client
// This will be in a server-only file