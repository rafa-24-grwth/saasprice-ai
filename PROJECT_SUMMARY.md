# SaaSPrice.AI - Project Summary & Roadmap

## Project Overview

**SaaSPrice.AI** is a Next.js 14 application that tracks and compares SaaS pricing data with institutional-grade accuracy. The platform scrapes pricing information from vendor websites, normalizes it for comparison, and provides confidence scores and trust indicators.

### Core Value Proposition
- **Normalized Pricing Comparison**: Compare SaaS vendors with different pricing models (per-seat, usage-based, tiered, etc.)
- **Confidence Scoring**: Each price point includes confidence scores based on verification level, freshness, and source agreement
- **Budget-Conscious Scraping**: Multi-method scraping system (Playwright, Firecrawl, Vision AI) with cost controls (<$100/month)
- **Trust Indicators**: Verification badges, freshness stamps, and methodology transparency

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

## Project Structure

### File Tree

```
saasprice-ai/
├── config/
│   └── vendors-top30.yaml          # Vendor configuration (30 priority vendors)
│
├── scripts/
│   ├── check-schema.ts             # Schema validation script
│   ├── generate-types.sh           # Database type generation
│   ├── seed-vendors.ts             # Vendor seeding script
│   └── testing/
│       ├── test-plan-tier.ts       # Plan tier testing
│       └── test-price-insert.ts    # Price insertion testing
│
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── (protected)/            # Protected routes (require auth)
│   │   │   ├── compare/
│   │   │   │   └── page.tsx        # Comparison tool page
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx        # Main dashboard
│   │   │   ├── settings/
│   │   │   │   └── page.tsx        # User settings
│   │   │   ├── vendors/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx    # Individual vendor detail page
│   │   │   │   └── page.tsx        # Vendors listing page
│   │   │   └── layout.tsx          # Protected layout
│   │   │
│   │   ├── api/                    # API routes
│   │   │   ├── admin/
│   │   │   │   └── trigger-schedule/route.ts
│   │   │   ├── budget/
│   │   │   │   └── status/route.ts
│   │   │   ├── compare/
│   │   │   │   ├── route.ts        # Comparison API
│   │   │   │   └── share/route.ts  # Shareable comparison links
│   │   │   ├── cron/
│   │   │   │   └── scheduled-scrape/route.ts
│   │   │   ├── dashboard/route.ts
│   │   │   ├── debug/
│   │   │   │   └── scraper-status/route.ts
│   │   │   ├── export/route.ts
│   │   │   ├── jobs/
│   │   │   │   └── [id]/
│   │   │   │       ├── cancel/route.ts
│   │   │   │       └── retry/route.ts
│   │   │   ├── leads/route.ts
│   │   │   ├── monitoring/
│   │   │   │   └── stats/route.ts
│   │   │   ├── scrape/route.ts
│   │   │   ├── search/route.ts
│   │   │   ├── test/
│   │   │   │   ├── orchestrator/route.ts
│   │   │   │   └── real-scrape/route.ts
│   │   │   ├── vendor/
│   │   │   │   └── [id]/
│   │   │   │       ├── scrape/route.ts
│   │   │   │       └── settings/route.ts
│   │   │   ├── vendors/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── plans/route.ts
│   │   │   │   │   └── route.ts
│   │   │   │   ├── filters/route.ts
│   │   │   │   ├── route.ts
│   │   │   │   └── search/route.ts
│   │   │   └── worker/
│   │   │       └── process-jobs/route.ts
│   │   │
│   │   ├── auth/
│   │   │   └── callback/route.ts   # OAuth callback handler
│   │   │
│   │   ├── compare/
│   │   │   ├── error.tsx
│   │   │   └── loading.tsx
│   │   │
│   │   ├── demo/
│   │   │   └── trust/page.tsx       # Trust indicators demo
│   │   │
│   │   ├── forgot-password/page.tsx
│   │   ├── login/page.tsx
│   │   ├── monitoring/page.tsx      # Monitoring dashboard
│   │   ├── page.tsx                 # Landing page
│   │   ├── pricing/[slug]/page.tsx  # Public pricing page
│   │   ├── reset-password/page.tsx
│   │   │
│   │   ├── layout.tsx               # Root layout
│   │   ├── providers.tsx            # React providers (theme, etc.)
│   │   ├── globals.css              # Global styles
│   │   └── utils/
│   │       └── charts.ts            # Chart utilities
│   │
│   ├── components/
│   │   ├── comparison/              # Comparison feature components
│   │   │   ├── CompareForm.tsx
│   │   │   ├── ComparisonChart.tsx
│   │   │   ├── ComparisonResults.tsx
│   │   │   ├── ComparisonTable.tsx
│   │   │   ├── ExportOptions.tsx
│   │   │   ├── RangeChart.tsx
│   │   │   └── VendorSelector.tsx
│   │   │
│   │   ├── dashboard/               # Dashboard components
│   │   │   ├── ActivityTimeline.tsx
│   │   │   ├── AlertPanel.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ExportButton.tsx
│   │   │   ├── HealthIndicator.tsx
│   │   │   ├── HistoricalChart.tsx
│   │   │   ├── JobActions.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── MethodUsageChart.tsx
│   │   │   ├── MetricList.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── TrendChart.tsx
│   │   │   ├── VendorActions.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── shared/                    # Shared components
│   │   │   ├── common/
│   │   │   │   └── Alert.tsx
│   │   │   ├── landing/               # Landing page components
│   │   │   │   ├── FAQ.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── HowItWorks.tsx
│   │   │   │   ├── Pricing.tsx
│   │   │   │   ├── ProductPillars.tsx
│   │   │   │   ├── ROICalculator.tsx
│   │   │   │   └── TrustBar.tsx
│   │   │   ├── monetization/
│   │   │   │   └── EmailCaptureModal.tsx
│   │   │   ├── search/
│   │   │   │   └── AdvancedSearch.tsx
│   │   │   ├── trust/                 # Trust indicator components
│   │   │   │   ├── ConfidenceIndicator.tsx
│   │   │   │   ├── FreshnessStamp.tsx
│   │   │   │   ├── MethodologyPopover.tsx
│   │   │   │   ├── VerificationBadge.tsx
│   │   │   │   └── index.ts
│   │   │   └── ui/                    # shadcn/ui components
│   │   │       ├── alert.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── dropdown-menu.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── popover.tsx
│   │   │       ├── select.tsx
│   │   │       ├── skeleton.tsx
│   │   │       ├── StatCard.tsx
│   │   │       ├── switch.tsx
│   │   │       ├── tabs.tsx
│   │   │       └── tooltip.tsx
│   │   │
│   │   └── vendors/                   # Vendor-specific components
│   │       ├── PricingCard.tsx
│   │       └── VendorHeader.tsx
│   │
│   ├── config/
│   │   ├── scraping-budget.ts        # Budget configuration & limits
│   │   └── theme.ts                   # Theme configuration
│   │
│   ├── hooks/                        # React hooks
│   │   ├── useAuth.tsx
│   │   ├── useComparison.ts
│   │   ├── useDashboard.ts
│   │   ├── useDebounce.ts
│   │   ├── useEmailCapture.ts
│   │   └── useVendorPricing.ts
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   └── client.ts             # Database client
│   │   │
│   │   ├── monitoring/               # Monitoring utilities
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   ├── index.ts
│   │   │   ├── utils.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── normalization/
│   │   │   └── engine.ts             # Price normalization engine
│   │   │
│   │   ├── services/
│   │   │   ├── api.service.ts
│   │   │   ├── scheduling.service.ts
│   │   │   ├── vendor.service.ts
│   │   │   └── scrapers/             # Scraping services
│   │   │       ├── budget-manager.ts
│   │   │       ├── firecrawl-scraper.ts
│   │   │       ├── orchestrator.ts
│   │   │       ├── playwright-scraper.ts
│   │   │       └── vision-scraper.ts
│   │   │
│   │   ├── supabase/                 # Supabase utilities
│   │   │   ├── auth-client.ts
│   │   │   ├── auth-server.ts
│   │   │   ├── auth.ts
│   │   │   ├── client.ts
│   │   │   ├── rpc-helpers.ts
│   │   │   ├── server.ts
│   │   │   ├── typed-rpc.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── supabase.ts
│   │   └── utils.ts
│   │
│   ├── services/                     # Business logic services
│   │   ├── comparison/
│   │   │   └── comparison.service.ts
│   │   ├── dashboard/
│   │   │   └── dashboard.service.ts
│   │   └── vendor/
│   │       └── vendor.service.ts
│   │
│   ├── theme/
│   │   └── colors.ts                 # Color theme definitions
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── api.types.ts
│   │   ├── charts.ts
│   │   ├── comparison.ts
│   │   ├── dashboard.ts
│   │   ├── database-helpers.ts
│   │   ├── database-scheduling.ts
│   │   ├── database.generated.ts    # Auto-generated from Supabase
│   │   ├── database.ts               # Main database types
│   │   ├── domain.types.ts
│   │   ├── pricing.ts                # Core pricing types
│   │   ├── rpc.ts
│   │   ├── scraping.ts               # Scraping system types
│   │   ├── utils.ts
│   │   └── vendor-config.ts          # Vendor config validation
│   │
│   └── utils/                        # Utility functions
│       ├── api-error.ts
│       ├── charts.ts
│       ├── comparison-export.ts
│       ├── format.ts
│       └── pricing-helpers.ts
│
├── supabase/
│   └── migrations/                   # Database migrations (empty currently)
│
├── public/                           # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── middleware.ts                     # Next.js middleware (auth)
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies
└── README.md                         # Basic Next.js README
```

---

## Detailed Component Breakdown

### 1. **Core Application Pages**

#### Landing Page (`src/app/page.tsx`)
- Marketing landing page with hero, features, pricing, FAQ
- SEO optimized with structured data
- Email capture for lead generation

#### Protected Routes (`src/app/(protected)/`)
- **Dashboard** (`dashboard/page.tsx`): Main user dashboard with metrics, charts, job status
- **Compare** (`compare/page.tsx`): Side-by-side vendor comparison tool
- **Vendors** (`vendors/page.tsx` & `vendors/[id]/page.tsx`): Vendor listing and detail pages
- **Settings** (`settings/page.tsx`): User preferences and account settings

#### Public Pages
- **Pricing** (`pricing/[slug]/page.tsx`): Public pricing page for individual vendors
- **Monitoring** (`monitoring/page.tsx`): System health and scraping statistics
- **Auth Pages**: Login, forgot password, reset password

### 2. **API Routes** (`src/app/api/`)

#### Core Features
- **`/api/vendors`**: Vendor CRUD operations, search, filtering
- **`/api/compare`**: Comparison logic and shareable links
- **`/api/dashboard`**: Dashboard data aggregation
- **`/api/search`**: Global search functionality
- **`/api/export`**: Data export (CSV, JSON)

#### Scraping System
- **`/api/scrape`**: Manual scrape trigger
- **`/api/cron/scheduled-scrape`**: Scheduled scraping jobs
- **`/api/vendor/[id]/scrape`**: Vendor-specific scraping
- **`/api/worker/process-jobs`**: Background job processor
- **`/api/jobs/[id]`**: Job management (cancel, retry)

#### Monitoring & Admin
- **`/api/monitoring/stats`**: System statistics
- **`/api/budget/status`**: Scraping budget tracking
- **`/api/debug/scraper-status`**: Debug scraper health
- **`/api/admin/trigger-schedule`**: Admin schedule triggers

#### Testing
- **`/api/test/orchestrator`**: Test scraping orchestrator
- **`/api/test/real-scrape`**: Test real scraping operations

### 3. **Scraping System** (`src/lib/services/scrapers/`)

#### Architecture
Multi-method scraping with cost controls:

1. **Playwright Scraper** (`playwright-scraper.ts`)
   - Free, self-hosted browser automation
   - Primary method for most vendors
   - CSS selector-based extraction

2. **Firecrawl Scraper** (`firecrawl-scraper.ts`)
   - Paid service ($0.01/page)
   - Handles complex JavaScript-heavy sites
   - Fallback when Playwright fails

3. **Vision Scraper** (`vision-scraper.ts`)
   - GPT-4 Vision API (~$0.02/image)
   - Last resort for complex pricing pages
   - Screenshot-based extraction

4. **Orchestrator** (`orchestrator.ts`)
   - Coordinates scraping methods
   - Implements escalation logic
   - Manages retries and failures

5. **Budget Manager** (`budget-manager.ts`)
   - Tracks spending across daily/weekly/monthly periods
   - Enforces budget limits ($80/month target)
   - Method selection based on budget availability

#### Budget Configuration (`src/config/scraping-budget.ts`)
- Method costs, budget limits, escalation rules
- Vendor tier-based frequency (daily/weekly/biweekly)
- Rate limiting per method
- Vendor-specific overrides

### 4. **Data Normalization** (`src/lib/normalization/engine.ts`)

Converts diverse pricing models to comparable formats:
- **Per-seat pricing**: Normalized to monthly cost
- **Usage-based**: Calculated for standard usage scenarios
- **Tiered pricing**: Handles volume discounts
- **Credit packs**: Converts to per-unit pricing
- **Annual vs Monthly**: Normalized to monthly equivalent

### 5. **Type System** (`src/types/`)

#### Core Types
- **`pricing.ts`**: Pricing models, confidence scoring, trust metadata
- **`scraping.ts`**: Scraping methods, job queue, budget tracking
- **`vendor-config.ts`**: Vendor configuration schema (Zod validation)
- **`database.ts`**: Database schema types (generated + helpers)
- **`comparison.ts`**: Comparison data structures
- **`dashboard.ts`**: Dashboard metrics and statistics

### 6. **Services Layer** (`src/services/`)

Business logic separated from API routes:
- **`vendor.service.ts`**: Vendor data operations
- **`comparison.service.ts`**: Comparison calculations
- **`dashboard.service.ts`**: Dashboard aggregations

### 7. **UI Components**

#### Comparison Components (`src/components/comparison/`)
- `CompareForm`: Input form for comparison parameters
- `ComparisonTable`: Side-by-side comparison table
- `ComparisonChart`: Visual price comparison
- `RangeChart`: Price range visualization
- `ExportOptions`: Export functionality

#### Dashboard Components (`src/components/dashboard/`)
- `StatCard`: Metric display cards
- `HistoricalChart`: Price history over time
- `TrendChart`: Trend analysis
- `MethodUsageChart`: Scraping method usage
- `ActivityTimeline`: Recent activity feed
- `HealthIndicator`: System health status
- `JobActions`: Scraping job controls

#### Trust Components (`src/components/shared/trust/`)
- `ConfidenceIndicator`: Confidence score display
- `FreshnessStamp`: Last update timestamp
- `VerificationBadge`: Verification level badge
- `MethodologyPopover`: Methodology explanation

### 8. **Database Schema** (Supabase)

Key tables (inferred from types):
- **`vendors`**: Vendor information
- **`plans`**: Pricing plans per vendor
- **`price_facts`**: Historical price data
- **`price_evidence`**: Evidence/sources for prices
- **`scrape_runs`**: Scraping job history
- **`comparison_shares`**: Shareable comparison links

---

## Current Implementation Status

### ✅ Completed Features

1. **Core Infrastructure**
   - Next.js 14 App Router setup
   - Supabase integration (auth + database)
   - TypeScript type system
   - Tailwind CSS + shadcn/ui components

2. **Scraping System**
   - Multi-method scraper architecture
   - Budget management system
   - Orchestrator with escalation logic
   - Budget tracking and limits

3. **Pricing System**
   - Normalization engine
   - Confidence scoring
   - Trust metadata system
   - Parse method hierarchy

4. **UI Components**
   - Landing page (complete)
   - Dashboard components (most complete)
   - Comparison components (complete)
   - Trust indicators (complete)

5. **API Routes**
   - Most API routes scaffolded
   - Vendor CRUD operations
   - Comparison API
   - Scraping endpoints

### ⚠️ Partially Complete / Needs Work

1. **Database Migrations**
   - `supabase/migrations/` is empty
   - Schema likely exists but migrations not tracked
   - Need to generate initial migration

2. **Testing**
   - No test files found (`.test.ts`, `.spec.ts`)
   - Test scripts in `package.json` but no tests written
   - Need comprehensive test coverage

3. **Error Handling**
   - Some API routes may lack proper error handling
   - Need consistent error response format

4. **Authentication Flow**
   - Middleware exists but may need refinement
   - OAuth callback handler present
   - Need to verify all protected routes

5. **Scraping Implementation**
   - Scraper services exist but may need:
     - Real Firecrawl API integration
     - Vision API integration
     - Better error recovery
     - Screenshot storage

6. **Data Validation**
   - Zod schemas for vendor config
   - May need more validation in API routes

### ❌ Missing / Not Started

1. **Database Migrations**
   - Initial schema migration
   - Seed data migrations
   - Indexes and constraints

2. **Testing Infrastructure**
   - Unit tests for services
   - Integration tests for API routes
   - E2E tests for critical flows
   - Test utilities and mocks

3. **Documentation**
   - API documentation
   - Component documentation
   - Deployment guide
   - Contributing guide

4. **Monitoring & Observability**
   - Error tracking (Sentry, etc.)
   - Performance monitoring
   - Logging infrastructure
   - Alerting system

5. **CI/CD**
   - GitHub Actions workflows
   - Automated testing
   - Deployment pipeline
   - Environment management

6. **Advanced Features**
   - Email notifications
   - Price change alerts
   - User preferences
   - API rate limiting
   - Caching layer (Redis?)

7. **Production Readiness**
   - Environment variable validation
   - Security hardening
   - Performance optimization
   - SEO improvements
   - Analytics integration

8. **Vendor Management**
   - Vendor onboarding workflow
   - Vendor verification process
   - Vendor admin panel

9. **Data Quality**
   - Data validation pipelines
   - Duplicate detection
   - Anomaly detection
   - Manual review queue

10. **Export & Integration**
    - CSV/JSON export (API exists, may need UI)
    - API for third-party integrations
    - Webhook support

---

## Roadmap Recommendations

### Phase 1: Foundation (Weeks 1-2)
1. **Database Migrations**
   - Create initial schema migration
   - Add indexes for performance
   - Seed initial vendor data

2. **Testing Setup**
   - Configure Vitest
   - Write tests for core services
   - Add API route tests

3. **Error Handling**
   - Standardize error responses
   - Add error boundaries
   - Implement retry logic

### Phase 2: Core Features (Weeks 3-4)
1. **Scraping System**
   - Complete Firecrawl integration
   - Complete Vision API integration
   - Implement screenshot storage
   - Add job queue persistence

2. **Data Pipeline**
   - Price normalization testing
   - Confidence score validation
   - Evidence collection system

3. **UI Polish**
   - ✅ Fixed layout typo (`layou.tsx` → `layout.tsx`)
   - Complete dashboard functionality
   - Add loading states
   - Improve error states

### Phase 3: Production Readiness (Weeks 5-6)
1. **Monitoring**
   - Set up error tracking
   - Add performance monitoring
   - Implement logging
   - Create alerting rules

2. **Security**
   - Security audit
   - Rate limiting
   - Input validation
   - SQL injection prevention

3. **Documentation**
   - API documentation
   - Component docs
   - Deployment guide

### Phase 4: Advanced Features (Weeks 7-8+)
1. **User Features**
   - Price change alerts
   - Saved comparisons
   - Export functionality
   - User preferences

2. **Admin Features**
   - Vendor management UI
   - Scraping job monitoring
   - Budget dashboard
   - Analytics

3. **Integrations**
   - Webhook system
   - Public API
   - Third-party integrations

---

## Key Files to Review

### Critical for Understanding
1. **`src/types/pricing.ts`**: Core pricing type system
2. **`src/config/scraping-budget.ts`**: Budget configuration
3. **`src/lib/services/scrapers/orchestrator.ts`**: Scraping coordination
4. **`src/lib/normalization/engine.ts`**: Price normalization
5. **`src/services/comparison/comparison.service.ts`**: Comparison logic

### Configuration Files
1. **`config/vendors-top30.yaml`**: Vendor configuration
2. **`package.json`**: Dependencies and scripts
3. **`next.config.js`**: Next.js configuration
4. **`tailwind.config.js`**: Styling configuration

### Entry Points
1. **`src/app/page.tsx`**: Landing page
2. **`src/app/layout.tsx`**: Root layout
3. **`middleware.ts`**: Auth middleware

---

## Notes & Observations

1. **✅ Fixed**: `src/app/(protected)/layou.tsx` renamed to `layout.tsx`

2. **No Tests**: Comprehensive test suite needed

3. **Empty Migrations**: Database migrations folder is empty - schema may be managed differently

4. **Budget System**: Well-designed budget management system with multiple safeguards

5. **Type Safety**: Strong TypeScript typing throughout

6. **Component Organization**: Good separation of concerns

7. **Scraping Architecture**: Sophisticated multi-method approach with cost controls

8. **Trust System**: Comprehensive trust and confidence scoring system

---

## Next Steps

1. **✅ Complete**: Fixed `layou.tsx` typo
2. **High Priority**: Create database migrations
3. **High Priority**: Set up testing infrastructure
4. **Medium Priority**: Complete scraper integrations
5. **Medium Priority**: Add error handling
6. **Low Priority**: Documentation and polish

---

*Generated: $(date)*
*Project: SaaSPrice.AI*
*Version: 0.1.0*

