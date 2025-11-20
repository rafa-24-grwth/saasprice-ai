// scripts/check-schema.ts
// Check actual database schema
// Run with: export $(cat .env.local | grep -v '^#' | xargs) && npx tsx scripts/check-schema.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('🔍 Checking database schema...\n');

  // Check vendors table
  const { data: vendor } = await supabase.from('vendors').select('*').limit(1);
  if (vendor && vendor.length > 0) {
    console.log('📊 vendors table columns:');
    console.log(Object.keys(vendor[0]).join(', '));
  }

  // Check plans table  
  const { data: plan } = await supabase.from('plans').select('*').limit(1);
  if (plan && plan.length > 0) {
    console.log('\n📊 plans table columns:');
    console.log(Object.keys(plan[0]).join(', '));
  }

  // Try to query price_facts table
  console.log('\n📊 Checking price_facts table...');
  const { data: price, error: priceError } = await supabase
    .from('price_facts')
    .select('*')
    .limit(1);
    
  if (priceError) {
    console.log('❌ Error accessing price_facts:', priceError.message);
    
    // Try alternative table names
    console.log('\n🔍 Looking for price-related tables...');
    
    const alternatives = ['prices', 'pricing', 'price_data', 'plan_pricing', 'plan_prices'];
    for (const tableName of alternatives) {
      const { data, error } = await supabase.from(tableName).select('*').limit(1);
      if (!error) {
        console.log(`✅ Found table: ${tableName}`);
        if (data && data.length > 0) {
          console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    }
  } else if (price && price.length > 0) {
    console.log('✅ price_facts table columns:');
    console.log(Object.keys(price[0]).join(', '));
  } else {
    console.log('📭 price_facts table exists but is empty');
  }

  // Check scrape_runs table
  const { data: scrape } = await supabase.from('scrape_runs').select('*').limit(1);
  if (scrape && scrape.length > 0) {
    console.log('\n📊 scrape_runs table columns:');
    console.log(Object.keys(scrape[0]).join(', '));
  }
}

checkSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
