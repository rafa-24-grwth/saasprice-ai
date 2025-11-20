// scripts/test-price-insert.ts
// Test what columns are needed for price_facts
// Run with: export $(cat .env.local | grep -v '^#' | xargs) && npx tsx scripts/test-price-insert.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPriceInsert() {
  console.log('🧪 Testing price_facts insert...\n');

  // Get a plan to test with
  const { data: plan } = await supabase
    .from('plans')
    .select('id, name')
    .limit(1)
    .single();

  if (!plan) {
    console.error('No plans found. Run generate-mock-data-simple.ts first.');
    return;
  }

  console.log(`Using plan: ${plan.name} (${plan.id})\n`);

  // Based on the error, we know 'cadence' is required
  const attempts = [
    { 
      name: 'with cadence=monthly',
      data: { plan_id: plan.id, cadence: 'monthly' }
    },
    { 
      name: 'with cadence and price',
      data: { plan_id: plan.id, cadence: 'monthly', price: 10.00 }
    },
    { 
      name: 'with cadence and base_price',
      data: { plan_id: plan.id, cadence: 'monthly', base_price: 10.00 }
    },
    { 
      name: 'with cadence=annual',
      data: { plan_id: plan.id, cadence: 'annual' }
    },
    {
      name: 'with cadence=yearly', 
      data: { plan_id: plan.id, cadence: 'yearly' }
    }
  ];

  for (const attempt of attempts) {
    console.log(`Testing ${attempt.name}...`);
    const { data, error } = await supabase
      .from('price_facts')
      .insert(attempt.data)
      .select();

    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
      if (error.details) {
        console.log(`     Details: ${error.details}`);
      }
    } else {
      console.log(`  ✅ Success! Created with: ${JSON.stringify(attempt.data)}`);
      if (data && data[0]) {
        console.log(`     All columns in table:`);
        console.log(`     ${JSON.stringify(data[0], null, 2)}`);
        
        // Clean up test data
        await supabase.from('price_facts').delete().eq('id', data[0].id);
        break; // Stop after first success
      }
    }
  }
}

testPriceInsert()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
