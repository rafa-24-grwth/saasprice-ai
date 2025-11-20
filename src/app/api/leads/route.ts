import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import { ApiError, formatErrorResponse } from '@/utils/api-error';

// Type alias for Lead - using the actual database schema
type Lead = Database['public']['Tables']['leads']['Row'];
type LeadInteraction = Database['public']['Tables']['lead_interactions']['Row'];

// Request body validation schema
const leadSchema = z.object({
  email: z.string().email(),
  seats: z.number().min(1).max(10000),
  company: z.string().optional().nullable(),
  receiveUpdates: z.boolean().default(false),
  comparison: z.object({
    vendorA: z.string().optional(),
    vendorB: z.string().optional(),
    seatCount: z.number().optional(),
    billingPeriod: z.enum(['monthly', 'annual']).optional(),
  }).optional(),
});

type LeadData = z.infer<typeof leadSchema>;

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = leadSchema.parse(body);

    // Get Supabase client - cast to any to bypass typing issues
    const supabase = createClient() as any;

    // Check if lead already exists
    const { data: existingLead, error: checkError } = await supabase
      .from('leads')
      .select('id, email, company_domain, interaction_count, created_at')
      .eq('email', validatedData.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is what we want
      console.error('Error checking existing lead:', checkError);
      throw ApiError.database('Failed to check existing lead', checkError);
    }

    let leadId: string;
    let isNewLead = false;

    if (existingLead) {
      // Cast to Lead type
      const typedLead = existingLead as Lead;
      const currentInteractionCount = typedLead.interaction_count || 0;
      
      // Update existing lead with new information
      // Note: using company_domain instead of company
      const { data: updatedLead, error: updateError } = await supabase
        .from('leads')
        .update({
          // Map company from request to company_domain in database
          company_domain: validatedData.company !== undefined 
            ? validatedData.company 
            : typedLead.company_domain,
          team_size: validatedData.seats,
          newsletter_opt_in: validatedData.receiveUpdates,
          last_interaction_at: new Date().toISOString(),
          interaction_count: currentInteractionCount + 1,
        })
        .eq('id', typedLead.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating lead:', updateError);
        throw ApiError.database('Failed to update lead information', updateError);
      }

      leadId = (updatedLead as Lead).id;
    } else {
      // Create new lead
      const { data: newLead, error: createError } = await supabase
        .from('leads')
        .insert({
          email: validatedData.email,
          company_domain: validatedData.company, // Map to company_domain
          team_size: validatedData.seats,
          newsletter_opt_in: validatedData.receiveUpdates,
          source: 'comparison_export',
          last_interaction_at: new Date().toISOString(),
          interaction_count: 1,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating lead:', createError);
        throw ApiError.database('Failed to create lead', createError);
      }

      leadId = (newLead as Lead).id;
      isNewLead = true;
    }

    // If comparison data is provided, store it for analytics
    if (validatedData.comparison) {
      const { error: comparisonError } = await supabase
        .from('lead_interactions')
        .insert({
          lead_id: leadId,
          interaction_type: 'comparison_export',
          metadata: {
            vendor_a: validatedData.comparison.vendorA,
            vendor_b: validatedData.comparison.vendorB,
            seat_count: validatedData.comparison.seatCount,
            billing_period: validatedData.comparison.billingPeriod,
          },
        });

      if (comparisonError) {
        // Log error but don't fail the request
        console.error('Error storing comparison interaction:', comparisonError);
      }
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        leadId,
        isNewLead,
        message: isNewLead 
          ? 'Thank you! Check your email for the comparison report.'
          : 'Welcome back! Your comparison report is ready.',
      },
      { status: isNewLead ? 201 : 200 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return formatErrorResponse(
        ApiError.validation('Invalid request data', error.errors),
        'Failed to process lead'
      );
    }

    console.error('Unexpected error in /api/leads:', error);
    return formatErrorResponse(error, 'Failed to process lead');
  }
}

// GET /api/leads/check - Check if an email is already registered
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      throw ApiError.validation('Email parameter is required');
    }

    // Validate email format
    const emailSchema = z.string().email();
    const validatedEmail = emailSchema.parse(email);

    // Get Supabase client - cast to any
    const supabase = createClient() as any;

    // Check if lead exists
    const { data: lead, error } = await supabase
      .from('leads')
      .select('id, email, newsletter_opt_in, team_size')
      .eq('email', validatedEmail)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking lead:', error);
      throw ApiError.database('Failed to check lead', error);
    }

    if (lead) {
      // For privacy, only return that the email exists
      // Don't expose user data like team size or newsletter preferences
      return NextResponse.json({
        exists: true,
      });
    } else {
      return NextResponse.json({
        exists: false,
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return formatErrorResponse(
        ApiError.validation('Invalid email format', error.errors),
        'Failed to check lead'
      );
    }

    console.error('Unexpected error in /api/leads check:', error);
    return formatErrorResponse(error, 'Failed to check lead');
  }
}