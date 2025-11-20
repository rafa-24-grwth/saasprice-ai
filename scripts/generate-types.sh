#!/bin/bash

# Generate TypeScript types from Supabase database
# Run this after database migrations to update types

echo "Generating database types from Supabase..."

# Generate types
npx supabase gen types typescript --local > src/types/database.generated.ts

echo "✅ Database types generated at src/types/database.generated.ts"

# Create a clean database.ts file that exports the generated types
cat > src/types/database.ts << 'EOF'
/**
 * Database types generated from Supabase schema
 * Run `npm run db:generate` to regenerate
 */

export type { Database } from './database.generated';
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
EOF

echo "✅ Database type exports created at src/types/database.ts"