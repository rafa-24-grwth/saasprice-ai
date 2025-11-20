// scripts/test-plan-tier.ts
// Test what tier values are valid
// Run with: export $(cat .env.local | grep -v '^#' | xargs) && npx tsx scripts/test-plan-tier.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTierValues() {
  console.log('Testing tier values...\n');

  // Get a vendor
  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, name')
    .limit(1)
    .single();

  if (!vendor) {
    console.error('No vendors found');
    return;
  }

  // Test different tier values
  const tierTests = [
    'free', 'starter', 'basic', 'pro', 'professional', 
    'team', 'business', 'enterprise', 'scale', 'advanced',
    'tier1', 'tier2', 'tier3', 
    'Free', 'Pro', 'Business', 'Enterprise'
  ];

  for (const tier of tierTests) {
    const { error } = await supabase
      .from('plans')
      .insert({
        vendor_id: vendor.id,
        name: `Test ${tier}`,
        slug: `test-${tier}`,
        tier: tier,
        is_active: true
      });

    if (!error) {
      console.log(`✅ tier="${tier}" works`);
      // Clean up
      await supabase.from('plans').delete().eq('slug', `test-${tier}`);
      break;
    }
  }

  // If none worked, try without tier
  console.log('\nTrying without tier field...');
  const { data: planWithoutTier, error: noTierError } = await supabase
    .from('plans')
    .insert({
      vendor_id: vendor.id,
      name: 'Test No Tier',
      slug: 'test-no-tier',
      is_active: true
    })
    .select()
    .single();

  if (!noTierError && planWithoutTier) {
    console.log('✅ Plans can be created without tier field');
    console.log(`Default tier value: ${planWithoutTier.tier}`);
    await supabase.from('plans').delete().eq('id', planWithoutTier.id);
  } else {
    console.log('❌ tier seems to be required:', noTierError?.message);
  }
}

testTierValues()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
