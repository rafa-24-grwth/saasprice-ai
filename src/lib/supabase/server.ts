// lib/supabase/server.ts

// THIS FILE IS FOR SERVER-SIDE OPERATIONS ONLY
// Uses SERVICE ROLE KEY with full permissions

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Helper to validate this is running on server
if (typeof window !== 'undefined') {
  throw new Error(
    'SECURITY WARNING: /lib/supabase/server.ts is being imported on the client side! ' +
    'This file contains service role key logic and must only be used server-side.'
  );
}

// EXPLICIT NAMING: This clearly indicates it's for service role operations
// This should ONLY be called from server-side code (API routes, server components)
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL for server operations. ' +
      'Please check your .env.local file.'
    );
  }

  // Use SERVICE ROLE key with full permissions
  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

// Admin helper functions with consistent error handling

export const adminGetAllUsers = async () => {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    throw new Error(`Failed to get users: ${error.message}`);
  }
  
  return data.users;
}

export const adminGetUserById = async (userId: string) => {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  
  if (error) {
    throw new Error(`Failed to get user ${userId}: ${error.message}`);
  }
  
  return data.user;
}

export const adminDeleteUser = async (userId: string) => {
  const supabase = createServiceRoleClient();
  
  const { error } = await supabase.auth.admin.deleteUser(userId);
  
  if (error) {
    throw new Error(`Failed to delete user ${userId}: ${error.message}`);
  }
  
  return { success: true };
}

export const adminBulkInviteUsers = async (emails: string[]) => {
  const supabase = createServiceRoleClient();
  
  const results = await Promise.allSettled(
    emails.map(async (email) => {
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
      
      if (error) {
        throw new Error(`Failed to invite ${email}: ${error.message}`);
      }
      
      return { email, userId: data.user?.id };
    })
  );
  
  const successful = results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .map(r => r.value);
    
  const failed = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason);
  
  return { successful, failed };
}

// Scraping-related admin functions using your actual tables
export const adminGetScrapingHealth = async () => {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from('scraping_health')
    .select('*')
    .single();
  
  if (error) {
    throw new Error(`Failed to get scraping health: ${error.message}`);
  }
  
  return data;
}

export const adminGetRecentScrapeJobs = async (limit = 10) => {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from('scrape_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    throw new Error(`Failed to get recent scrape jobs: ${error.message}`);
  }
  
  return data;
}

export const adminGetCronLogs = async (endpoint?: string, limit = 20) => {
  const supabase = createServiceRoleClient();
  
  let query = supabase
    .from('cron_logs')
    .select('*')
    .order('executed_at', { ascending: false })
    .limit(limit);
  
  if (endpoint) {
    query = query.eq('endpoint', endpoint);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to get cron logs: ${error.message}`);
  }
  
  return data;
}

export const adminGetVendorStats = async () => {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from('vendors')
    .select('is_active, is_quarantined, category');
  
  if (error) {
    throw new Error(`Failed to get vendor stats: ${error.message}`);
  }
  
  const stats = {
    total: data.length,
    active: data.filter(v => v.is_active).length,
    quarantined: data.filter(v => v.is_quarantined).length,
    byCategory: data.reduce((acc, vendor) => {
      const cat = vendor.category || 'uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
  
  return stats;
}
// Alias for backward compatibility
export const createClient = createServiceRoleClient;
