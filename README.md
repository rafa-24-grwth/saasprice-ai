# SaaSPrice.AI

An AI-powered SaaS pricing tracking and comparison platform.

## Features

- **Vendor Tracking**: Automated scraping of SaaS pricing pages using Playwright and Firecrawl.
- **Price Analysis**: AI-driven analysis of pricing tiers and feature comparison.
- **Dashboard**: Visual insights into pricing trends and vendor data.
- **Scheduling**: Configurable cron jobs for regular data updates.
- **Authentication**: Secure user authentication via Supabase.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Scraping**: Playwright, Firecrawl
- **Deployment**: Vercel

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd saasprice-ai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Copy `.env.example` to `.env.local` and fill in your credentials:
    ```bash
    cp .env.example .env.local
    ```
    Required variables:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_KEY`
    - `CRON_SECRET`
    - `FIRECRAWL_API_KEY` (optional)

4.  **Run the development server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment

### GitHub
1.  Push your code to a GitHub repository.
2.  Ensure your repository is private if it contains business logic you wish to protect.

### Vercel
1.  Import your GitHub repository into Vercel.
2.  Configure the **Environment Variables** in Vercel project settings (matches `.env.local`).
3.  Deploy!

## License

[MIT](LICENSE)
# saasprice-ai
