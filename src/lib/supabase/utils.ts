/**
 * Type-safe Supabase client utilities
 * Handles both browser and server client types
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Type guard to check if a client is a valid Supabase client
 * This helps resolve the union type issue
 */
export function isSupabaseClient(
  client: any
): client is SupabaseClient<Database> {
  return client && typeof client.from === 'function';
}

/**
 * Safely get a Supabase client that can be used in services
 * Accepts either browser or server clients
 */
export function getServiceClient(
  client: any
): SupabaseClient<Database> {
  if (!isSupabaseClient(client)) {
    throw new Error('Invalid Supabase client provided to service');
  }
  return client;
}

/**
 * Type alias for service-compatible Supabase client
 * Use this in service method signatures
 */
export type ServiceSupabaseClient = SupabaseClient<Database>;