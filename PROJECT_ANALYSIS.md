# SaaSPrice.AI - Complete Project Analysis

## Executive Summary

**SaaSPrice.AI** is a Next.js 14 application that tracks and compares SaaS pricing data with institutional-grade accuracy. The platform scrapes pricing information from vendor websites using multiple methods (Playwright, Firecrawl, GPT-4 Vision), normalizes diverse pricing models for comparison, and provides confidence scores and trust indicators.

### Key Features
- **Multi-method scraping system** with budget controls (<$100/month)
- **Price normalization engine** that converts different pricing models to comparable formats
- **Confidence scoring system** based on verification level, freshness, and source agreement
- **Trust indicators** with verification badges, freshness stamps, and methodology transparency
- **Vendor comparison tool** for side-by-side pricing analysis
- **Dashboard** with metrics, charts, and activity tracking
- **Shareable comparison links** for collaboration

---

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: Radix UI + Tailwind CSS
- **Charts**: Recharts
- **Scraping**: Playwright, Firecrawl API, GPT-4 Vision
- **Validation**: Zod
- **State Management**: React Hooks

---

## Complete File Tree

```
saasprice-ai/
├── config/
│   └── vendors-top30.yaml              # Top 30 priority vendor configurations
│
├── scripts/
│   ├── check-schema.ts                 # Database schema validation script
│   ├── generate-types.sh               # Shell script to generate TypeScript types from Supabase
│   ├── seed-vendors.ts                 # Script to seed vendor data into database
│   └── testing/
│       ├── test-plan-tier.ts           # Test script for plan tier functionality
│       └── test-price-insert.ts        # Test script for price insertion
│
├── src/
│   ├── app/                            # Next.js App Router (pages & API routes)
│   │   ├── (protected)/                 # Protected routes requiring authentication
│   │   │   ├── compare/
│   │   │   │   └── page.tsx            # Vendor comparison tool page
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx           # Main user dashboard
│   │   │   ├── settings/
│   │   │   │   └── page.tsx           # User settings page
│   │   │   ├── vendors/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx       # Individual vendor detail page
│   │   │   │   └── page.tsx           # Vendors listing page
│   │   │   └── layout.tsx             # Protected layout wrapper (auth check)
│   │   │
│   │   ├── api/                        # API Routes (Next.js API handlers)
│   │   │   ├── admin/
│   │   │   │   └── trigger-schedule/
│   │   │   │       └── route.ts      # Admin endpoint to trigger scheduled scrapes
│   │   │   ├── budget/
│   │   │   │   └── status/
│   │   │   │       └── route.ts      # Budget status and health check
│   │   │   ├── compare/
│   │   │   │   ├── route.ts           # Comparison API (POST/GET)
│   │   │   │   └── share/
│   │   │   │       └── route.ts      # Shareable comparison link management
│   │   │   ├── cron/
│   │   │   │   └── scheduled-scrape/
│   │   │   │       └── route.ts      # Cron job endpoint for scheduled scraping
│   │   │   ├── dashboard/
│   │   │   │   └── route.ts           # Dashboard data aggregation API
│   │   │   ├── debug/
│   │   │   │   └── scraper-status/
│   │   │   │       └── route.ts      # Debug endpoint for scraper health
│   │   │   ├── export/
│   │   │   │   └── route.ts           # Data export (CSV, JSON, PDF)
│   │   │   ├── jobs/
│   │   │   │   └── [id]/
│   │   │   │       ├── cancel/
│   │   │   │       │   └── route.ts   # Cancel a scraping job
│   │   │   │       └── retry/
│   │   │   │           └── route.ts   # Retry a failed scraping job
│   │   │   ├── leads/
│   │   │   │   └── route.ts           # Lead capture API (email signups)
│   │   │   ├── monitoring/
│   │   │   │   └── stats/
│   │   │   │       └── route.ts      # System monitoring statistics
│   │   │   ├── scrape/
│   │   │   │   └── route.ts           # Main scraping API (create/check jobs)
│   │   │   ├── search/
│   │   │   │   └── route.ts           # Global search API
│   │   │   ├── test/
│   │   │   │   ├── firecrawl-direct/
│   │   │   │   │   └── route.ts      # Test Firecrawl integration
│   │   │   │   ├── orchestrator/
│   │   │   │   │   └── route.ts      # Test scraping orchestrator
│   │   │   │   └── real-scrape/
│   │   │   │       └── route.ts      # Test real scraping operations
│   │   │   ├── vendor/
│   │   │   │   └── [id]/
│   │   │   │       ├── scrape/
│   │   │   │       │   └── route.ts  # Vendor-specific scraping trigger
│   │   │   │       └── settings/
│   │   │   │           └── route.ts  # Vendor settings management
│   │   │   ├── vendors/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── plans/
│   │   │   │   │   │   └── route.ts  # Get plans for a vendor
│   │   │   │   │   └── route.ts      # Vendor CRUD operations
│   │   │   │   ├── filters/
│   │   │   │   │   └── route.ts      # Vendor filtering API
│   │   │   │   ├── route.ts          # Vendors list API
│   │   │   │   └── search/
│   │   │   │       └── route.ts      # Vendor search API
│   │   │   └── worker/
│   │   │       └── process-jobs/
│   │   │           └── route.ts      # Background job processor
│   │   │
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts          # OAuth callback handler (Supabase Auth)
│   │   │
│   │   ├── compare/
│   │   │   ├── error.tsx             # Error boundary for compare page
│   │   │   └── loading.tsx            # Loading state for compare page
│   │   │
│   │   ├── demo/
│   │   │   └── trust/
│   │   │       └── page.tsx          # Demo page for trust indicators
│   │   │
│   │   ├── forgot-password/
│   │   │   └── page.tsx               # Password reset request page
│   │   ├── login/
│   │   │   └── page.tsx               # Login page
│   │   ├── monitoring/
│   │   │   └── page.tsx               # System monitoring dashboard
│   │   ├── page.tsx                    # Landing page (marketing site)
│   │   ├── pricing/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Public pricing page for individual vendors
│   │   ├── reset-password/
│   │   │   └── page.tsx               # Password reset page
│   │   │
│   │   ├── layout.tsx                 # Root layout (metadata, fonts, providers)
│   │   ├── providers.tsx               # React providers (theme, etc.)
│   │   ├── globals.css                 # Global styles and Tailwind directives
│   │   └── utils/
│   │       └── charts.ts              # Chart utility functions
│   │
│   ├── components/                     # React components
│   │   ├── comparison/                 # Comparison feature components
│   │   │   ├── CompareForm.tsx        # Form for comparison parameters
│   │   │   ├── ComparisonChart.tsx    # Visual price comparison chart
│   │   │   ├── ComparisonResults.tsx  # Comparison results display
│   │   │   ├── ComparisonTable.tsx    # Side-by-side comparison table
│   │   │   ├── ExportOptions.tsx       # Export functionality UI
│   │   │   ├── RangeChart.tsx         # Price range visualization
│   │   │   └── VendorSelector.tsx     # Vendor selection component
│   │   │
│   │   ├── dashboard/                  # Dashboard components
│   │   │   ├── ActivityTimeline.tsx    # Recent activity feed
│   │   │   ├── AlertPanel.tsx         # Alert display panel
│   │   │   ├── EmptyState.tsx         # Empty state component
│   │   │   ├── ExportButton.tsx        # Export button component
│   │   │   ├── HealthIndicator.tsx     # System health status indicator
│   │   │   ├── HistoricalChart.tsx     # Price history over time chart
│   │   │   ├── JobActions.tsx          # Scraping job action buttons
│   │   │   ├── LoadingSpinner.tsx      # Loading spinner component
│   │   │   ├── MethodUsageChart.tsx    # Scraping method usage chart
│   │   │   ├── MetricList.tsx          # Metrics list display
│   │   │   ├── ProgressBar.tsx         # Progress bar component
│   │   │   ├── StatCard.tsx           # Metric display card
│   │   │   ├── StatusBadge.tsx         # Status badge component
│   │   │   ├── TrendChart.tsx          # Trend analysis chart
│   │   │   ├── VendorActions.tsx       # Vendor action buttons
│   │   │   └── index.ts                # Barrel export file
│   │   │
│   │   ├── shared/                     # Shared components
│   │   │   ├── common/
│   │   │   │   └── Alert.tsx          # Alert component
│   │   │   ├── landing/                # Landing page components
│   │   │   │   ├── FAQ.tsx             # FAQ section
│   │   │   │   ├── Footer.tsx          # Footer component
│   │   │   │   ├── Header.tsx          # Header/navigation
│   │   │   │   ├── HeroSection.tsx     # Hero section
│   │   │   │   ├── HowItWorks.tsx      # How it works section
│   │   │   │   ├── Pricing.tsx         # Pricing section
│   │   │   │   ├── ProductPillars.tsx  # Product features section
│   │   │   │   ├── ROICalculator.tsx   # ROI calculator component
│   │   │   │   └── TrustBar.tsx        # Trust indicators bar
│   │   │   ├── monetization/
│   │   │   │   └── EmailCaptureModal.tsx # Email capture modal
│   │   │   ├── search/
│   │   │   │   └── AdvancedSearch.tsx  # Advanced search component
│   │   │   ├── trust/                  # Trust indicator components
│   │   │   │   ├── ConfidenceIndicator.tsx    # Confidence score display
│   │   │   │   ├── FreshnessStamp.tsx          # Last update timestamp
│   │   │   │   ├── MethodologyPopover.tsx     # Methodology explanation
│   │   │   │   ├── VerificationBadge.tsx       # Verification level badge
│   │   │   │   └── index.ts                    # Barrel export
│   │   │   └── ui/                     # shadcn/ui components
│   │   │       ├── alert.tsx           # Alert UI component
│   │   │       ├── badge.tsx           # Badge component
│   │   │       ├── button.tsx          # Button component
│   │   │       ├── card.tsx            # Card component
│   │   │       ├── dialog.tsx          # Dialog/modal component
│   │   │       ├── dropdown-menu.tsx   # Dropdown menu
│   │   │       ├── input.tsx           # Input field
│   │   │       ├── label.tsx           # Label component
│   │   │       ├── popover.tsx         # Popover component
│   │   │       ├── select.tsx          # Select dropdown
│   │   │       ├── skeleton.tsx         # Loading skeleton
│   │   │       ├── StatCard.tsx        # Stat card component
│   │   │       ├── switch.tsx          # Toggle switch
│   │   │       ├── tabs.tsx            # Tabs component
│   │   │       └── tooltip.tsx          # Tooltip component
│   │   │
│   │   └── vendors/                    # Vendor-specific components
│   │       ├── PricingCard.tsx          # Pricing card display
│   │       └── VendorHeader.tsx        # Vendor header component
│   │
│   ├── config/                         # Configuration files
│   │   ├── scraping-budget.ts          # Budget configuration & limits
│   │   └── theme.ts                    # Theme configuration
│   │
│   ├── hooks/                          # React hooks
│   │   ├── useAuth.tsx                 # Authentication hook
│   │   ├── useComparison.ts             # Comparison functionality hook
│   │   ├── useDashboard.ts              # Dashboard data hook
│   │   ├── useDebounce.ts               # Debounce utility hook
│   │   ├── useEmailCapture.ts           # Email capture hook
│   │   └── useVendorPricing.ts         # Vendor pricing data hook
│   │
│   ├── lib/                             # Library code (utilities & services)
│   │   ├── db/
│   │   │   └── client.ts               # Database client wrapper
│   │   │
│   │   ├── monitoring/                  # Monitoring utilities
│   │   │   ├── api.ts                   # Monitoring API functions
│   │   │   ├── hooks.ts                 # Monitoring React hooks
│   │   │   ├── index.ts                 # Barrel export
│   │   │   ├── utils.ts                 # Monitoring utilities
│   │   │   └── types.ts                 # Monitoring types (if separate)
│   │   │
│   │   ├── normalization/
│   │   │   └── engine.ts                # Price normalization engine
│   │   │
│   │   ├── services/                    # Business logic services
│   │   │   ├── api.service.ts           # API service utilities
│   │   │   ├── scheduling.service.ts    # Scheduling service
│   │   │   ├── vendor.service.ts        # Vendor service
│   │   │   └── scrapers/                # Scraping services
│   │   │       ├── budget-manager.ts     # Budget tracking and management
│   │   │       ├── firecrawl-scraper.ts # Firecrawl API scraper
│   │   │       ├── orchestrator.ts      # Scraping orchestrator (coordinates methods)
│   │   │       ├── playwright-scraper.ts # Playwright browser scraper
│   │   │       └── vision-scraper.ts    # GPT-4 Vision scraper
│   │   │
│   │   ├── supabase/                    # Supabase utilities
│   │   │   ├── auth-client.ts           # Client-side auth utilities
│   │   │   ├── auth-server.ts           # Server-side auth utilities
│   │   │   ├── auth.ts                  # Auth utilities (shared)
│   │   │   ├── client.ts                # Supabase client creation
│   │   │   ├── rpc-helpers.ts           # RPC function helpers
│   │   │   ├── server.ts                # Server-side Supabase client
│   │   │   ├── typed-rpc.ts             # Typed RPC functions
│   │   │   └── utils.ts                 # Supabase utilities
│   │   │
│   │   ├── supabase.ts                  # Supabase configuration
│   │   └── utils.ts                     # General utilities
│   │
│   ├── services/                        # Business logic services (alternative location)
│   │   ├── comparison/
│   │   │   └── comparison.service.ts    # Comparison calculation service
│   │   ├── dashboard/
│   │   │   └── dashboard.service.ts     # Dashboard aggregation service
│   │   └── vendor/
│   │       └── vendor.service.ts       # Vendor data service
│   │
│   ├── theme/
│   │   └── colors.ts                    # Color theme definitions
│   │
│   ├── types/                           # TypeScript type definitions
│   │   ├── api.types.ts                 # API request/response types
│   │   ├── charts.ts                    # Chart data types
│   │   ├── comparison.ts                # Comparison types
│   │   ├── dashboard.ts                 # Dashboard types
│   │   ├── database-helpers.ts          # Database helper types
│   │   ├── database-scheduling.ts       # Scheduling-related DB types
│   │   ├── database.generated.ts       # Auto-generated from Supabase
│   │   ├── database.ts                  # Main database types
│   │   ├── domain.types.ts              # Domain model types
│   │   ├── pricing.ts                   # Core pricing types (CRITICAL)
│   │   ├── rpc.ts                       # RPC function types
│   │   ├── scraping.ts                  # Scraping system types
│   │   ├── utils.ts                    # Utility types
│   │   └── vendor-config.ts            # Vendor config validation (Zod)
│   │
│   └── utils/                           # Utility functions
│       ├── api-error.ts                 # API error handling utilities
│       ├── charts.ts                    # Chart utility functions
│       ├── comparison-export.ts         # Comparison export utilities
│       ├── format.ts                    # Formatting utilities
│       └── pricing-helpers.ts           # Pricing calculation helpers
│
├── supabase/
│   └── migrations/                      # Database migrations (currently empty)
│
├── public/                              # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── middleware.ts                        # Next.js middleware (auth protection)
├── next.config.js                       # Next.js configuration
├── tailwind.config.js                   # Tailwind CSS configuration
├── postcss.config.js                    # PostCSS configuration
├── tsconfig.json                        # TypeScript configuration
├── package.json                         # Dependencies and scripts
├── package-lock.json                    # Locked dependency versions
├── eslint.config.mjs                    # ESLint configuration
├── README.md                            # Basic Next.js README
└── PROJECT_SUMMARY.md                   # Project summary (existing)
```

---

## Detailed File Explanations

### Root Configuration Files

#### `package.json`
- **Purpose**: Defines project dependencies, scripts, and metadata
- **Key Dependencies**:
  - Next.js 14.2.5 (App Router)
  - React 18.3.1
  - Supabase client libraries
  - Radix UI components
  - Recharts for data visualization
  - Playwright for browser automation
  - Zod for validation
- **Scripts**:
  - `dev`: Start development server
  - `build`: Production build
  - `db:generate`: Generate TypeScript types from Supabase schema
  - `type-check`: TypeScript type checking

#### `next.config.js`
- **Purpose**: Next.js configuration
- **Key Settings**:
  - React strict mode enabled
  - Image domains configured (localhost, supabase.co)
  - CORS headers for API routes
  - Server actions body size limit (2MB)

#### `middleware.ts`
- **Purpose**: Next.js middleware for authentication and route protection
- **Functionality**:
  - Checks Supabase session on every request
  - Redirects unauthenticated users from protected routes to login
  - Redirects authenticated users away from auth pages
  - Stores intended destination for post-login redirect

#### `tsconfig.json`
- **Purpose**: TypeScript compiler configuration
- **Key Settings**:
  - Path aliases (`@/*` → `./src/*`)
  - Strict mode enabled
  - ES2020 target
  - Next.js plugin integration

---

### Configuration Files

#### `config/vendors-top30.yaml`
- **Purpose**: Configuration for top 30 priority vendors
- **Structure**: YAML file with vendor definitions including:
  - `slug`: URL-friendly identifier
  - `name`: Display name
  - `category`: Vendor category
  - `pricing_url`: URL to scrape
  - `priority`: Scraping priority (1-3)
  - `scrape_hints`: Selectors and scraping hints

#### `src/config/scraping-budget.ts`
- **Purpose**: Budget management configuration for scraping system
- **Key Exports**:
  - `METHOD_COSTS`: Cost per scraping method (playwright: $0, firecrawl: $0.01, vision: $0.02)
  - `BUDGET_LIMITS`: Daily/weekly/monthly budget limits ($80/month target)
  - `SCRAPE_FREQUENCY`: Tier-based scraping frequency (daily/weekly/biweekly)
  - `ESCALATION_RULES`: When to escalate from free to paid methods
  - `RETRY_CONFIG`: Retry configuration per method
  - `VENDOR_OVERRIDES`: Vendor-specific overrides
- **Functions**:
  - `canAffordMethod()`: Check if budget allows a method
  - `selectScrapingMethod()`: Auto-select best method based on budget
  - `getBudgetHealth()`: Get budget health status

---

### Core Type Definitions

#### `src/types/pricing.ts` ⭐ **CRITICAL**
- **Purpose**: Core pricing type system - the foundation of the entire pricing system
- **Key Types**:
  - `ParseMethod`: How data was obtained (api, selector, firecrawl, vision, etc.)
  - `VerificationLevel`: API_VERIFIED, MONITORED, SELF_REPORTED
  - `ConfidenceFactors`: Factors that affect confidence score
  - `TrustMetadata`: Complete trust information for a price
  - `NormalizationSpec`: Specification for price normalization
  - `PriceFact`: Database record for a price observation
  - `PriceEvidence`: Evidence/source for a price fact
  - `Vendor`, `Plan`: Core entity types
- **Key Functions**:
  - `calculateConfidence()`: Calculate confidence score from multiple factors
  - `buildTrustMetadata()`: Build trust metadata from price fact and evidence
  - `parseMethodToVerificationLevel()`: Map parse method to verification level
- **Confidence Mapping**: Each parse method has a confidence score (0-1):
  - `api`: 0.99
  - `selector`: 0.90
  - `manual_reviewed`: 0.85
  - `firecrawl`: 0.80
  - `heuristic`: 0.70
  - `vision`: 0.60
  - `manual`: 0.50

#### `src/types/scraping.ts`
- **Purpose**: Types for the scraping system
- **Key Types**:
  - `ScrapingMethod`: playwright | firecrawl | vision | manual
  - `ScrapeStatus`: pending | success | failed | partial | skipped
  - `VendorScrapeConfig`: Configuration for scraping a vendor
  - `ScrapeResult`: Result from a scraping attempt
  - `BudgetConfig`: Budget management configuration
  - `ScrapeJob`: Job in the scraping queue
  - `ScrapeSession`: Batch scraping session
  - `ScrapeStats`: Statistics for monitoring

#### `src/types/database.ts`
- **Purpose**: Auto-generated TypeScript types from Supabase schema
- **Structure**: Contains type definitions for all database tables:
  - `vendors`: Vendor information
  - `plans`: Pricing plans
  - `price_facts`: Historical price data
  - `price_evidence`: Evidence for prices
  - `scrape_runs`: Scraping job history
  - `scrape_jobs`: Job queue
  - `comparison_shares`: Shareable comparison links
  - `budget_tracking`: Budget usage tracking
  - And many more...

---

### Scraping System

#### `src/lib/services/scrapers/orchestrator.ts` ⭐ **CRITICAL**
- **Purpose**: Coordinates scraping methods with escalation logic
- **Key Functions**:
  - `scrapeVendor()`: Main function to scrape a vendor
  - `determineStrategy()`: Determine which methods to try and in what order
  - `executeScraping()`: Execute a specific scraping method
  - `updateVendorStatus()`: Update vendor status after scrape
  - `quarantineVendor()`: Quarantine vendor after too many failures
- **Escalation Chain**: playwright → firecrawl → vision → manual
- **Logic**:
  1. Check budget status
  2. Determine strategy based on vendor tier and budget
  3. Try methods in order until success or all exhausted
  4. Record results and update vendor status
  5. Quarantine vendors with too many failures

#### `src/lib/services/scrapers/playwright-scraper.ts`
- **Purpose**: Free browser automation scraper using Playwright
- **Method**: Uses headless browser to navigate to pricing page and extract data
- **Cost**: $0 (uses own infrastructure)
- **Use Case**: Primary method for most vendors

#### `src/lib/services/scrapers/firecrawl-scraper.ts`
- **Purpose**: Paid scraper using Firecrawl API
- **Method**: Calls Firecrawl API to scrape JavaScript-heavy sites
- **Cost**: ~$0.01 per page
- **Use Case**: Fallback when Playwright fails, handles complex React apps

#### `src/lib/services/scrapers/vision-scraper.ts`
- **Purpose**: Last resort scraper using GPT-4 Vision
- **Method**: Takes screenshot and uses GPT-4 Vision to extract pricing
- **Cost**: ~$0.02 per image
- **Use Case**: Last resort for complex pricing pages

#### `src/lib/services/scrapers/budget-manager.ts`
- **Purpose**: Tracks and manages scraping budget
- **Functionality**:
  - Tracks daily/weekly/monthly spending
  - Allocates budget before scraping
  - Records actual costs after scraping
  - Provides budget health status
  - Enforces budget limits

---

### Price Normalization

#### `src/lib/normalization/engine.ts` ⭐ **CRITICAL**
- **Purpose**: Converts diverse pricing models to comparable formats
- **Key Class**: `NormalizationEngine`
- **Methods**:
  - `buildSpec()`: Build normalization spec from raw data
  - `normalize()`: Normalize pricing to target units and period
  - `createPriceFact()`: Create database price fact from normalized data
- **Pricing Models Supported**:
  1. **Simple**: Base price + overage
  2. **Tiered**: Progressive unit pricing with tiers
  3. **Credit**: Credit pack-based pricing (uses dynamic programming)
  4. **Contact**: Custom pricing (no public pricing)
- **Normalization Process**:
  1. Parse raw pricing data
  2. Detect pricing model
  3. Calculate normalized value based on model
  4. Convert to target period (monthly/annual)
  5. Generate formula and assumptions
  6. Calculate confidence score

---

### API Routes

#### `src/app/api/scrape/route.ts`
- **Purpose**: Main scraping API endpoint
- **POST**: Creates a scraping job and adds to queue
  - Validates request with Zod
  - Checks budget status
  - Auto-selects or validates scraping method
  - Pre-allocates budget
  - Creates job in database
  - Returns job ID and estimated wait time
- **GET**: Check status of a scraping job
  - Returns job status, progress, results
  - Supports query by `job_id` or `vendor_id`

#### `src/app/api/vendors/route.ts`
- **Purpose**: Vendor CRUD operations
- **GET**: List all vendors (with authentication)
- Uses `vendorService` for business logic

#### `src/app/api/compare/route.ts`
- **Purpose**: Comparison API
- **POST**: Create comparison between vendors
- **GET**: Get comparison data
- Uses `comparisonService` for calculations

#### `src/app/api/dashboard/route.ts`
- **Purpose**: Dashboard data aggregation
- Aggregates metrics, trends, activity for dashboard display

#### `src/app/api/cron/scheduled-scrape/route.ts`
- **Purpose**: Cron job endpoint for scheduled scraping
- Triggered by external cron service (e.g., Vercel Cron)
- Processes scheduled scraping jobs

---

### Services Layer

#### `src/services/comparison/comparison.service.ts`
- **Purpose**: Business logic for vendor comparisons
- **Key Methods**:
  - `compareVendors()`: Compare multiple vendors with plans, prices, features
  - `createShareLink()`: Create shareable comparison link
  - `getSharedComparison()`: Retrieve shared comparison
  - `normalizePrice()`: Normalize price to monthly equivalent
- **Process**:
  1. Fetch vendors, plans, prices, features
  2. Group and normalize prices
  3. Build comparison data structure
  4. Generate metadata (price ranges, categories)

#### `src/services/vendor/vendor.service.ts`
- **Purpose**: Vendor data operations
- Handles vendor CRUD, search, filtering

#### `src/services/dashboard/dashboard.service.ts`
- **Purpose**: Dashboard data aggregation
- Aggregates metrics, trends, activity data

---

### Pages

#### `src/app/page.tsx` (Landing Page)
- **Purpose**: Marketing landing page
- **Sections**:
  - Hero section
  - Trust bar (social proof)
  - Product pillars (features)
  - How it works
  - ROI calculator
  - Pricing
  - FAQ
  - Footer
- **SEO**: Includes structured data (JSON-LD) for SEO

#### `src/app/(protected)/dashboard/page.tsx`
- **Purpose**: Main user dashboard
- **Features**:
  - Stat cards (vendors tracked, comparisons, savings)
  - Spending trend chart
  - Activity timeline
  - Watchlist
  - Recent price changes
  - Quick actions
- **Data**: Uses `useDashboard` hook to fetch data

#### `src/app/(protected)/compare/page.tsx`
- **Purpose**: Vendor comparison tool
- **Features**:
  - Vendor selection (up to max vendors)
  - Comparison table view
  - Comparison chart view
  - Export options (CSV, PDF, JSON)
  - Share functionality
  - Save comparison
- **State**: Uses `useComparison` hook

#### `src/app/(protected)/vendors/page.tsx`
- **Purpose**: Vendors listing page
- Displays all vendors with filtering and search

#### `src/app/(protected)/vendors/[id]/page.tsx`
- **Purpose**: Individual vendor detail page
- Shows vendor information, plans, pricing history, trust indicators

---

### Components

#### Comparison Components (`src/components/comparison/`)
- **CompareForm.tsx**: Form for comparison parameters (seats, period, etc.)
- **ComparisonChart.tsx**: Visual price comparison using Recharts
- **ComparisonTable.tsx**: Side-by-side comparison table
- **VendorSelector.tsx**: Vendor selection component with search

#### Dashboard Components (`src/components/dashboard/`)
- **StatCard.tsx**: Metric display card
- **TrendChart.tsx**: Price trend over time
- **ActivityTimeline.tsx**: Recent activity feed
- **HealthIndicator.tsx**: System health status

#### Trust Components (`src/components/shared/trust/`)
- **ConfidenceIndicator.tsx**: Displays confidence score (0-100%)
- **FreshnessStamp.tsx**: Shows last update timestamp
- **VerificationBadge.tsx**: Shows verification level badge
- **MethodologyPopover.tsx**: Explains methodology on hover/click

#### UI Components (`src/components/shared/ui/`)
- shadcn/ui components (button, card, dialog, etc.)
- Built on Radix UI primitives
- Styled with Tailwind CSS

---

### Hooks

#### `src/hooks/useDashboard.ts`
- **Purpose**: Dashboard data fetching and state management
- **Features**:
  - Fetches dashboard data from API
  - Handles loading and error states
  - Auto-refresh capability
  - Period selection (24h, 7d, 30d, 90d)

#### `src/hooks/useComparison.ts`
- **Purpose**: Comparison functionality
- **Features**:
  - Manages selected vendors
  - Fetches comparison data
  - Handles save, export, share
  - Validates vendor limits

#### `src/hooks/useAuth.tsx`
- **Purpose**: Authentication state management
- Provides user session, login, logout functions

---

### Utilities

#### `src/utils/pricing-helpers.ts`
- **Purpose**: Pricing calculation helper functions
- Functions for price calculations, formatting, conversions

#### `src/utils/comparison-export.ts`
- **Purpose**: Export comparison data to various formats
- Supports CSV, JSON, PDF export

#### `src/utils/api-error.ts`
- **Purpose**: Standardized API error handling
- `ApiError` class and `formatErrorResponse()` function

---

## How Everything Works Together

### 1. **User Flow: Landing → Dashboard**

1. User visits `/` (landing page)
2. Clicks "Get Started" → redirected to `/login`
3. After login → redirected to `/dashboard`
4. Middleware checks authentication on every request
5. Dashboard uses `useDashboard` hook → calls `/api/dashboard`
6. API route uses `dashboardService` → queries Supabase
7. Data displayed in dashboard components

### 2. **Scraping Flow**

1. **Scheduled Scraping**:
   - Cron job calls `/api/cron/scheduled-scrape`
   - Determines which vendors need scraping based on frequency
   - Creates jobs in `scrape_jobs` table
   - Worker process (`/api/worker/process-jobs`) picks up jobs

2. **Manual Scraping**:
   - User/admin calls `/api/scrape` (POST)
   - API validates request, checks budget
   - Creates job in queue
   - Returns job ID immediately (async pattern)

3. **Job Processing**:
   - Worker picks up job from queue
   - Calls `orchestrator.scrapeVendor()`
   - Orchestrator:
     - Checks budget with `BudgetManager`
     - Determines strategy (which methods to try)
     - Tries methods in order: playwright → firecrawl → vision
     - Records results in database
     - Updates vendor status
   - If all methods fail → marks for manual review

4. **Data Processing**:
   - Raw scraped data goes to `NormalizationEngine`
   - Engine normalizes pricing to comparable format
   - Creates `PriceFact` record in database
   - Creates `PriceEvidence` records for sources
   - Calculates confidence score based on parse method and freshness

### 3. **Comparison Flow**

1. User navigates to `/compare`
2. Selects vendors using `VendorSelector`
3. `useComparison` hook manages selected vendors
4. When ready, calls `/api/compare` (POST)
5. API uses `comparisonService.compareVendors()`
6. Service:
   - Fetches vendors, plans, prices, features
   - Normalizes prices to monthly equivalent
   - Builds comparison data structure
   - Returns formatted comparison
7. UI displays in `ComparisonTable` or `ComparisonChart`
8. User can export (CSV/PDF/JSON) or share link

### 4. **Budget Management Flow**

1. Before scraping:
   - `BudgetManager.canAfford(method)` checks if budget allows
   - `BudgetManager.allocate(method, vendor_id)` pre-allocates budget
   - If allocation fails → fallback to free method or reject

2. During scraping:
   - Actual cost tracked in `ScrapeResult`
   - Budget recorded in `budget_tracking` table

3. After scraping:
   - `BudgetManager.recordResult(result)` records actual cost
   - Budget usage updated (daily/weekly/monthly)
   - Health status checked

4. Budget limits:
   - Daily: $3
   - Weekly: $20
   - Monthly: $80
   - Alerts at 75%, 90%, shutdown at 95%

### 5. **Trust & Confidence System**

1. **Parse Method** determines base confidence:
   - API: 0.99
   - Selector: 0.90
   - Firecrawl: 0.80
   - Vision: 0.60
   - Manual: 0.50

2. **Freshness** affects confidence:
   - Data older than 30 days loses up to 20% confidence

3. **Source Agreement**:
   - Multiple sources agreeing increases confidence
   - Disagreement decreases confidence

4. **Final Confidence**:
   - Calculated by `calculateConfidence()` in `pricing.ts`
   - Stored in `PriceFact.confidence_score`
   - Displayed via `ConfidenceIndicator` component

5. **Verification Level**:
   - API_VERIFIED: Highest trust (API data)
   - MONITORED: Medium trust (automated scraping)
   - SELF_REPORTED: Lower trust (manual entry)

### 6. **Database Schema (Key Tables)**

- **vendors**: Vendor information, scraping config, status
- **plans**: Pricing plans per vendor
- **price_facts**: Historical price observations
- **price_evidence**: Evidence/sources for prices
- **scrape_runs**: Scraping job history
- **scrape_jobs**: Job queue
- **comparison_shares**: Shareable comparison links
- **budget_tracking**: Budget usage tracking

---

## Architecture Patterns

### 1. **Layered Architecture**
- **Presentation**: Pages and components
- **API Layer**: Next.js API routes
- **Service Layer**: Business logic services
- **Data Layer**: Supabase database

### 2. **Separation of Concerns**
- UI components are pure presentation
- Business logic in services
- API routes are thin controllers
- Types are centralized

### 3. **Budget-Conscious Design**
- Free methods tried first
- Escalation only when necessary
- Budget pre-allocation prevents overspending
- Multiple budget periods (daily/weekly/monthly)

### 4. **Trust & Transparency**
- Every price has confidence score
- Evidence stored for auditability
- Methodology explained to users
- Freshness tracked and displayed

### 5. **Async Job Processing**
- Scraping jobs are queued
- Immediate response with job ID
- Client polls for status
- Worker processes jobs in background

---

## Key Design Decisions

1. **Multi-Method Scraping**: Ensures high success rate while controlling costs
2. **Budget Management**: Prevents cost overruns with multiple safeguards
3. **Confidence Scoring**: Provides transparency about data quality
4. **Normalization Engine**: Enables comparison of diverse pricing models
5. **Type Safety**: Strong TypeScript typing throughout
6. **Component Reusability**: Shared components for consistency
7. **Async Job Pattern**: Prevents timeouts on long-running scrapes

---

## Current Status

### ✅ Completed
- Core infrastructure (Next.js, Supabase, TypeScript)
- Scraping system architecture
- Budget management system
- Price normalization engine
- UI components (most)
- API routes (most)
- Authentication system
- Landing page

### ⚠️ Needs Work
- Database migrations (empty folder)
- Testing (no test files found)
- Error handling (some routes may need improvement)
- Scraper implementations (may need real API integrations)

### ❌ Missing
- Test suite
- CI/CD pipeline
- Error tracking (Sentry, etc.)
- Performance monitoring
- Comprehensive documentation

---

## Next Steps

1. **High Priority**:
   - Create database migrations
   - Set up testing infrastructure
   - Complete scraper API integrations

2. **Medium Priority**:
   - Add error handling
   - Set up monitoring
   - Performance optimization

3. **Low Priority**:
   - Documentation
   - Additional features
   - UI polish

---

*Generated: $(date)*
*Project: SaaSPrice.AI*
*Version: 0.1.0*


