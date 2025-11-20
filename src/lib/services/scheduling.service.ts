// src/lib/services/scheduling.service.ts

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

// Simple types for scheduling without complex extensions
interface VendorForScraping {
  id: string;
  name: string;
  last_scraped_at: string | null;
  scrape_priority: number;
  hours_since_scrape: number;
}

interface ScrapeJob {
  id: string;
  vendor_id: string;
  status: string;
  priority: number;
  source: string;
  created_at: string;
  expires_at: string;
  completed_at?: string | null;
  result_data?: any;
  error_message?: string | null;
}

interface CronLog {
  id: string;
  endpoint: string;
  status: string;
  vendors_queued: number;
  vendors_failed: number;
  details: any;
  error_message: string | null;
  executed_at: string;
  duration_ms: number | null;
}

interface ScrapingHealth {
  total_vendors: number;
  active_vendors: number;
  never_scraped: number;
  stale_24h: number;
  stale_7d: number;
  failing_vendors: number;
  oldest_scrape: string | null;
  newest_scrape: string | null;
}

export interface SchedulingConfig {
  maxVendorsPerRun: number;
  defaultFrequencyHours: number;
  staleThresholdHours: number;
  maxRetries: number;
}

export interface ScheduledScrapeResult {
  vendor: string;
  vendorId: string;
  success: boolean;
  jobId?: string;
  error?: string;
}

export class SchedulingService {
  private supabase: any; // Temporarily use any to bypass type issues
  private config: SchedulingConfig;

  constructor(config: Partial<SchedulingConfig> = {}) {
    this.supabase = createClient();
    this.config = {
      maxVendorsPerRun: config.maxVendorsPerRun ?? 5,
      defaultFrequencyHours: config.defaultFrequencyHours ?? 24,
      staleThresholdHours: config.staleThresholdHours ?? 24,
      maxRetries: config.maxRetries ?? 3,
    };
  }

  /**
   * Get vendors that need scraping based on schedule
   */
  async getVendorsForScheduledScrape(): Promise<VendorForScraping[]> {
    const { data, error } = await this.supabase
      .rpc('get_vendors_for_scheduled_scrape', { 
        max_vendors: this.config.maxVendorsPerRun 
      });

    if (error) {
      throw new Error(`Failed to fetch vendors for scheduled scrape: ${error.message}`);
    }

    return (data as VendorForScraping[]) ?? [];
  }

  /**
   * Queue scraping jobs for multiple vendors
   */
  async queueScrapeJobs(
    vendors: VendorForScraping[], 
    source: 'manual' | 'scheduled' | 'api' | 'retry' = 'scheduled'
  ): Promise<ScheduledScrapeResult[]> {
    const results: ScheduledScrapeResult[] = [];

    for (const vendor of vendors) {
      try {
        const { data, error } = await this.supabase
          .from('scrape_jobs')
          .insert({
            vendor_id: vendor.id,
            status: 'pending',
            priority: vendor.scrape_priority ?? 50,
            source,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        const job = data as ScrapeJob;
        if (job) {
          results.push({
            vendor: vendor.name,
            vendorId: vendor.id,
            success: true,
            jobId: job.id,
          });
          console.log(`✅ Queued scrape job for ${vendor.name} (job_id: ${job.id})`);
        }
      } catch (error) {
        console.error(`❌ Failed to queue job for ${vendor.name}:`, error);
        results.push({
          vendor: vendor.name,
          vendorId: vendor.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Update vendor status after scrape completion
   */
  async updateVendorScrapeStatus(
    vendorId: string, 
    success: boolean, 
    errorMessage?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .rpc('update_vendor_scrape_status', {
        vendor_id_param: vendorId,
        success,
        error_message: errorMessage ?? null,
      });

    if (error) {
      throw new Error(`Failed to update vendor scrape status: ${error.message}`);
    }
  }

  /**
   * Get scraping health metrics
   */
  async getScrapingHealth(): Promise<ScrapingHealth> {
    const { data, error } = await this.supabase
      .from('scraping_health')
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to fetch scraping health: ${error.message}`);
    }

    return data as ScrapingHealth;
  }

  /**
   * Get recent cron logs for monitoring
   */
  async getRecentCronLogs(limit: number = 10): Promise<CronLog[]> {
    const { data, error } = await this.supabase
      .from('cron_logs')
      .select('*')
      .order('executed_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch cron logs: ${error.message}`);
    }

    return (data as CronLog[]) ?? [];
  }

  /**
   * Log cron execution
   */
  async logCronExecution(
    endpoint: string,
    status: 'success' | 'error' | 'warning',
    details: {
      vendors_queued?: number;
      vendors_failed?: number;
      message?: string;
      results?: any;
      error?: string;
      duration_ms?: number;
    },
    errorMessage?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('cron_logs')
      .insert({
        endpoint,
        status,
        vendors_queued: details.vendors_queued ?? 0,
        vendors_failed: details.vendors_failed ?? 0,
        details,
        error_message: errorMessage ?? null,
        executed_at: new Date().toISOString(),
        duration_ms: details.duration_ms ?? null
      });

    if (error) {
      console.error('Error logging cron execution:', error);
    }
  }

  /**
   * Check if a vendor needs scraping
   */
  async vendorNeedsScraping(vendorId: string): Promise<boolean> {
    const { data: vendor, error } = await this.supabase
      .from('vendors')
      .select('is_active')
      .eq('id', vendorId)
      .single();

    if (error || !vendor?.is_active) {
      return false;
    }

    return true;
  }

  /**
   * Get vendors by priority tier
   */
  async getVendorsByPriority(minPriority: number = 0): Promise<Database['public']['Tables']['vendors']['Row'][]> {
    const { data, error } = await this.supabase
      .from('vendors')
      .select('*')
      .gte('priority', minPriority)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch vendors by priority: ${error.message}`);
    }

    return (data as Database['public']['Tables']['vendors']['Row'][]) ?? [];
  }

  /**
   * Disable vendor after repeated failures
   */
  async handleVendorFailures(vendorId: string, consecutiveFailures: number): Promise<void> {
    if (consecutiveFailures >= 5) {
      const { error } = await this.supabase
        .from('vendors')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (error) {
        throw new Error(`Failed to disable vendor: ${error.message}`);
      }

      console.warn(`⚠️ Vendor ${vendorId} disabled after ${consecutiveFailures} failures`);
    }
  }
}