import { NextResponse } from 'next/server';
import BudgetManagerService from '@/lib/services/scrapers/budget-manager';

export const dynamic = 'force-dynamic';

/**
 * GET /api/budget/status
 * Returns current budget status and health metrics
 * 
 * Response:
 * {
 *   success: boolean
 *   data: {
 *     budget: BudgetConfig
 *     health: BudgetHealth  
 *     canScrape: boolean
 *   }
 * }
 */
export async function GET() {
  try {
    // Initialize budget table if needed (safe to call multiple times)
    await BudgetManagerService.initializeTable();
    
    // Get current budget status
    const budgetStatus = await BudgetManagerService.getStatus();
    
    if (!budgetStatus) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to get budget status'
        },
        { status: 500 }
      );
    }
    
    // Get scraping health metrics
    const scrapingHealth = await BudgetManagerService.getHealth();
    
    // Check if we can scrape (any method available within budget)
    const canScrape = budgetStatus.health.status !== 'exhausted';
    
    return NextResponse.json({
      success: true,
      data: {
        budget: {
          limits: budgetStatus.budget.limits,
          usage: budgetStatus.budget.usage,
          method_costs: budgetStatus.budget.method_costs
        },
        health: {
          status: budgetStatus.health.status,
          message: budgetStatus.health.message,
          remaining: budgetStatus.health.remaining
        },
        scraping: {
          status: scrapingHealth.status,
          system: scrapingHealth.system,
          recent_stats: scrapingHealth.recent_stats,
          budget: scrapingHealth.budget
        },
        canScrape,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error fetching budget status:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch budget status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}