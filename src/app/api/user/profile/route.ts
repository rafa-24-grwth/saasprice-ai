import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch profile
    const { data: profile, error } = await supabase
      .from('profiles') // Table name is profiles, not user_profiles
      .select('*')
      .eq('id', user.id) // Primary key is id (which matches auth.uid)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
      throw error;
    }

    // If no profile exists, return basic info from auth user
    const userProfile = profile ? {
      ...profile,
      // Map DB columns to frontend expected shape
      company: profile.company_name, 
      // role: profile.role // role column doesn't exist in DB
    } : {
      id: user.id,
      email: user.email,
      full_name: '',
      company: '',
      role: '',
      subscription_tier: 'free',
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    return NextResponse.json({ profile: userProfile });
  } catch (error: any) {
    console.error('Profile API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      code: error.code
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, company, role } = body;

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    let error;
    
    if (existingProfile) {
      // Update
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name,
          company_name: company, // Map company -> company_name
          // role, // Role column does not exist
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      error = updateError;
    } else {
      // Insert
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id, // id matches auth.uid
          email: user.email,
          full_name,
          company_name: company,
          // role,
          subscription_tier: 'free',
        });
      error = insertError;
    }

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      code: error.code,
      details: error.details
    }, { status: 500 });
  }
}

