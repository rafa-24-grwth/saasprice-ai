// src/app/api/export/route.ts
// Fixed version with proper null handling

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Request validation schema
const exportRequestSchema = z.object({
  vendorIds: z.array(z.string()).min(1).max(10),
  seatCount: z.number().min(1).max(10000).default(10),
  billingPeriod: z.enum(['monthly', 'annual']).default('monthly'),
  includeDetails: z.boolean().default(true),
  format: z.enum(['csv', 'json']).default('csv'),
});

type ExportRequest = z.infer<typeof exportRequestSchema>;

// CSV generation helper
function generateCSV(data: any[][], headers: string[]): string {
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [
    headers.map(escapeCSV).join(','),
    ...data.map(row => row.map(escapeCSV).join(',')),
  ];

  return csvRows.join('\n');
}

// Safe date formatter
function formatDate(date: string | null | undefined): string {
  if (!date) return '';
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch {
    return '';
  }
}

// Safe string handler
function safeString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// Calculate normalized pricing
function calculatePricing(
  priceFact: any,
  seatCount: number,
  targetPeriod: 'monthly' | 'annual'
): {
  totalCost: number;
  perSeatCost: number;
  normalizedCost: number;
} {
  const basePrice = Number(priceFact?.base_price) || 0;
  let totalCost = basePrice;
  
  // Handle different pricing models
  const pricingModel = priceFact?.pricing_model || 'flat';
  
  switch (pricingModel) {
    case 'per_seat':
    case 'per_user':
      totalCost = basePrice * seatCount;
      break;
      
    case 'tiered':
      if (priceFact?.price_per_additional_seat) {
        const additionalSeats = Math.max(0, seatCount - 1);
        totalCost = basePrice + (Number(priceFact.price_per_additional_seat) * additionalSeats);
      } else {
        totalCost = basePrice * seatCount;
      }
      break;
      
    case 'enterprise':
      totalCost = Number(priceFact?.enterprise_price) || basePrice;
      break;
      
    case 'flat':
    default:
      totalCost = basePrice;
      break;
  }
  
  // Normalize to requested period
  let normalizedCost = totalCost;
  
  if (priceFact?.cadence === 'yearly' && targetPeriod === 'monthly') {
    normalizedCost = totalCost / 12;
  } else if (priceFact?.cadence === 'monthly' && targetPeriod === 'annual') {
    normalizedCost = totalCost * 12;
  }
  
  const perSeatCost = seatCount > 0 ? normalizedCost / seatCount : 0;
  
  return {
    totalCost,
    perSeatCost,
    normalizedCost,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = exportRequestSchema.parse(body);
    const supabase = createServiceRoleClient();
    
    // Fetch vendors with their plans
    const { data: vendors, error: vendorError } = await supabase
      .from('vendors')
      .select(`
        id,
        name,
        category,
        pricing_url,
        logo_url,
        slug,
        plans (
          id,
          name,
          tier,
          display_name,
          description
        )
      `)
      .in('id', validatedData.vendorIds)
      .eq('is_active', true);

    if (vendorError || !vendors || vendors.length === 0) {
      return NextResponse.json(
        { error: 'Failed to fetch vendor data or no vendors found' },
        { status: vendorError ? 500 : 404 }
      );
    }

    // Get all plan IDs
    const planIds: string[] = [];
    vendors.forEach((vendor: any) => {
      if (vendor.plans && Array.isArray(vendor.plans)) {
        vendor.plans.forEach((plan: any) => {
          if (plan.id) planIds.push(plan.id);
        });
      }
    });

    if (planIds.length === 0) {
      return NextResponse.json(
        { error: 'No plans found for selected vendors' },
        { status: 404 }
      );
    }

    // Fetch price facts
    const { data: priceFacts, error: priceError } = await supabase
      .from('price_facts')
      .select('*')
      .in('plan_id', planIds)
      .eq('is_current', true);

    if (priceError) {
      return NextResponse.json(
        { error: 'Failed to fetch pricing data' },
        { status: 500 }
      );
    }

    // Create price map
    const priceMap = new Map<string, any>();
    if (priceFacts) {
      priceFacts.forEach((pf: any) => {
        // Store most recent price for each plan
        if (!priceMap.has(pf.plan_id)) {
          priceMap.set(pf.plan_id, pf);
        }
      });
    }

    // Prepare data based on format
    if (validatedData.format === 'json') {
      const jsonData = vendors.map((vendor: any) => ({
        id: vendor.id,
        name: vendor.name,
        category: vendor.category || 'SaaS',
        url: vendor.pricing_url,
        logo: vendor.logo_url,
        plans: (vendor.plans || []).map((plan: any) => {
          const pf = priceMap.get(plan.id);
          if (!pf) {
            return {
              id: plan.id,
              name: plan.display_name || plan.name,
              tier: plan.tier,
              pricing: { available: false }
            };
          }
          
          const pricing = calculatePricing(pf, validatedData.seatCount, validatedData.billingPeriod);
          return {
            id: plan.id,
            name: plan.display_name || plan.name,
            tier: plan.tier,
            pricing: {
              available: true,
              base_price: pf.base_price,
              normalized_cost: pricing.normalizedCost,
              per_seat_cost: pricing.perSeatCost,
              currency: pf.currency || 'USD',
              confidence_score: pf.confidence_score || 0.5,
              effective_date: formatDate(pf.effective_date)
            }
          };
        })
      }));

      return NextResponse.json({
        success: true,
        export_date: new Date().toISOString(),
        parameters: {
          seat_count: validatedData.seatCount,
          billing_period: validatedData.billingPeriod,
        },
        data: jsonData
      });
    }

    // Generate CSV
    const csvData: any[][] = [];
    const currentDate = new Date().toISOString().split('T')[0];
    
    for (const vendor of vendors as any[]) {
      for (const plan of (vendor.plans || [])) {
        const pf = priceMap.get(plan.id);
        
        if (!pf) {
          csvData.push([
            vendor.name,
            plan.display_name || plan.name,
            'N/A',
            'N/A',
            'No pricing data',
            safeString(vendor.pricing_url),
            currentDate
          ]);
          continue;
        }

        const pricing = calculatePricing(pf, validatedData.seatCount, validatedData.billingPeriod);

        if (validatedData.includeDetails) {
          csvData.push([
            vendor.name,
            safeString(vendor.category),
            plan.display_name || plan.name,
            safeString(plan.tier),
            (pf.base_price || 0).toFixed(2),
            pricing.normalizedCost.toFixed(2),
            pricing.perSeatCost.toFixed(2),
            safeString(pf.cadence),
            safeString(pf.currency || 'USD'),
            ((pf.confidence_score || 0.5) * 100).toFixed(0) + '%',
            safeString(pf.pricing_model || 'flat'),
            safeString(vendor.pricing_url),
            formatDate(pf.effective_date) || currentDate
          ]);
        } else {
          csvData.push([
            vendor.name,
            plan.display_name || plan.name,
            pricing.normalizedCost.toFixed(2),
            pricing.perSeatCost.toFixed(2),
            safeString(pf.currency || 'USD'),
            safeString(vendor.pricing_url),
            currentDate
          ]);
        }
      }
    }

    const headers = validatedData.includeDetails
      ? [
          'Vendor',
          'Category',
          'Plan',
          'Tier',
          'Base Price',
          `Total Cost (${validatedData.billingPeriod})`,
          'Per Seat Cost',
          'Billing Cadence',
          'Currency',
          'Confidence',
          'Pricing Model',
          'Pricing URL',
          'Effective Date'
        ]
      : [
          'Vendor',
          'Plan',
          `Total Cost (${validatedData.billingPeriod})`,
          'Per Seat Cost',
          'Currency',
          'Pricing URL',
          'Export Date'
        ];

    const csv = generateCSV(csvData, headers);
    const filename = `saasprice-export-${validatedData.seatCount}seats-${currentDate}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}