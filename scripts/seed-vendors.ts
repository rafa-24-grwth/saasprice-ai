// scripts/seed-vendors.ts
// Run with: export $(cat .env.local | grep -v '^#' | xargs) && npx tsx scripts/seed-vendors.ts

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedVendors() {
  console.log('🌱 Starting vendor seeding...\n');

  try {
    // Read the YAML file
    const yamlPath = path.join(process.cwd(), 'config', 'vendors-top30.yaml');
    console.log('📖 Reading vendor config from:', yamlPath);
    
    if (!fs.existsSync(yamlPath)) {
      console.error('❌ Config file not found:', yamlPath);
      process.exit(1);
    }

    const yamlContent = fs.readFileSync(yamlPath, 'utf8');
    const config = yaml.load(yamlContent) as any;

    if (!config.vendors || !Array.isArray(config.vendors)) {
      console.error('❌ Invalid config structure: missing vendors array');
      process.exit(1);
    }

    console.log(`📦 Found ${config.vendors.length} vendors to seed\n`);

    // Clear existing vendors
    console.log('🧹 Clearing existing vendors...');
    const { error: deleteError } = await supabase
      .from('vendors')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('Warning: Could not clear vendors:', deleteError.message);
    }

    // Insert vendors with ONLY the fields we know exist
    // Based on the error, pricing_url is required (NOT NULL)
    const vendorsToInsert = config.vendors.map((vendor: any) => ({
      slug: vendor.slug,
      name: vendor.name,
      category: vendor.category,
      pricing_url: vendor.pricing_url, // Required field
      priority: vendor.priority,
      is_active: true,
      // Removed: website, tags, scrape_config, description (don't exist)
    }));

    console.log('📝 Inserting vendors with fields: slug, name, category, pricing_url, priority, is_active');

    const { data: insertedVendors, error: insertError } = await supabase
      .from('vendors')
      .insert(vendorsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Failed to insert vendors:', insertError.message);
      console.error('Error details:', insertError);
      process.exit(1);
    }

    console.log(`✅ Successfully inserted ${insertedVendors?.length || 0} vendors`);
    
    // List what was inserted
    if (insertedVendors && insertedVendors.length > 0) {
      console.log('\n📋 Inserted vendors:');
      insertedVendors.forEach((v: any) => {
        console.log(`  - ${v.name} (${v.slug}) - Priority: ${v.priority}`);
      });
      
      // Show the actual structure of inserted data
      console.log('\n🔍 Sample vendor structure:');
      console.log(JSON.stringify(insertedVendors[0], null, 2));
    }

    // Verify the final count
    const { count } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📊 Total vendors in database: ${count || 0}`);
    console.log('\n✨ You can now run: npx tsx scripts/generate-mock-data.ts');

  } catch (error) {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  }
}

// Run the seeding
seedVendors()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
