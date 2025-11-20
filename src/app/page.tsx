import { Metadata } from 'next';
import Header from '@/components/shared/landing/Header';
import HeroSection from '@/components/shared/landing/HeroSection';
import TrustBar from '@/components/shared/landing/TrustBar';
import ProductPillars from '@/components/shared/landing/ProductPillars';
import HowItWorks from '@/components/shared/landing/HowItWorks';
import ROICalculator from '@/components/shared/landing/ROICalculator';
import Pricing from '@/components/shared/landing/Pricing';
import FAQ from '@/components/shared/landing/FAQ';
import Footer from '@/components/shared/landing/Footer';

export const metadata: Metadata = {
  title: 'SaaSPrice.AI - Track SaaS Pricing Changes in Real-Time',
  description: 'The intelligent platform for tracking SaaS pricing changes and optimizing software spend. Get instant alerts, historical data, and ROI insights. Trusted by RevOps and FP&A teams.',
  keywords: 'SaaS pricing, price tracking, software spend optimization, RevOps tools, FP&A software, SaaS management, vendor price monitoring',
  openGraph: {
    title: 'SaaSPrice.AI - Track SaaS Pricing Changes in Real-Time',
    description: 'Stop overpaying for SaaS. Track price changes across 500+ vendors and save 23% on software spend.',
    url: 'https://saasprice.ai',
    siteName: 'SaaSPrice.AI',
    images: [
      {
        url: 'https://saasprice.ai/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SaaSPrice.AI - SaaS Price Tracking Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaaSPrice.AI - Track SaaS Pricing Changes',
    description: 'Stop overpaying for SaaS. Track price changes across 500+ vendors.',
    images: ['https://saasprice.ai/twitter-image.png'],
    creator: '@saasprice_ai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://saasprice.ai',
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
};

export default function LandingPage() {
  return (
    <>
      {/* Skip to main content for accessibility */}
      <a 
        href="#main" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>

      {/* Header Navigation */}
      <Header />

      {/* Main Content */}
      <main id="main" className="flex-grow">
        {/* Hero Section */}
        <section id="hero" className="scroll-mt-20">
          <HeroSection />
        </section>

        {/* Trust Bar - Social Proof */}
        <TrustBar />

        {/* Product Pillars / Features */}
        <section id="features" className="scroll-mt-20">
          <ProductPillars />
        </section>

        {/* How it Works - NEW SECTION */}
        <section id="how-it-works" className="scroll-mt-20">
          <HowItWorks />
        </section>

        {/* ROI Calculator / Spend Analyzer */}
        <section id="roi-calculator" className="scroll-mt-20">
          <ROICalculator />
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-20">
          <Pricing />
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20">
          <FAQ />
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'SaaSPrice.AI',
            description: 'SaaS price tracking and optimization platform',
            url: 'https://saasprice.ai',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'AggregateOffer',
              lowPrice: '0',
              highPrice: '99',
              priceCurrency: 'USD',
              offerCount: '3',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '127',
              bestRating: '5',
            },
            publisher: {
              '@type': 'Organization',
              name: 'SaaSPrice.AI',
              url: 'https://saasprice.ai',
              logo: 'https://saasprice.ai/logo.png',
              sameAs: [
                'https://twitter.com/saasprice_ai',
                'https://linkedin.com/company/saasprice-ai',
                'https://github.com/saasprice',
              ],
            },
          }),
        }}
      />

      {/* FAQ Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How often is pricing data updated?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Free plans receive weekly updates, Pro plans get daily updates, and Enterprise plans can configure real-time monitoring for critical vendors.',
                },
              },
              {
                '@type': 'Question',
                name: 'How accurate is your pricing data?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Our multi-method verification system achieves 99.7% accuracy using automated scraping, vendor APIs, and AI-powered analysis.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I change my plan later?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, downgrades at the next billing cycle.',
                },
              },
            ],
          }),
        }}
      />

      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'SaaSPrice.AI',
            url: 'https://saasprice.ai',
            logo: 'https://saasprice.ai/logo.png',
            description: 'The intelligent platform for tracking SaaS pricing changes and optimizing software spend.',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'US',
            },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+1-555-0123',
              contactType: 'customer service',
              email: 'support@saasprice.ai',
              availableLanguage: ['en'],
            },
            sameAs: [
              'https://twitter.com/saasprice_ai',
              'https://linkedin.com/company/saasprice-ai',
              'https://github.com/saasprice',
            ],
          }),
        }}
      />
    </>
  );
}