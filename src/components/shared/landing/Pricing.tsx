'use client';

// components/landing/Pricing.tsx
import React, { useState } from 'react';
import { Check, X, ArrowRight, Zap, Shield, Building2, Info } from 'lucide-react';

const colors = {
  ink900: '#0B1220',
  slate600: '#475569',
  snow50: '#F7F9FC',
  info: '#06B6D4',
  infoBg: '#E0F2FE',
  primary: '#2D5BFF',
  primaryHover: '#2449CC',
  success: '#10B981',
  successBg: '#ECFDF5',
  mist200: '#E5EAF2',
  white: '#FFFFFF',
  verified: '#7C3AED',
  verifiedBg: '#F4EFFE',
  error: '#EF4444',
};

interface PricingTier {
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  features: {
    text: string;
    included: boolean;
    tooltip?: string;
  }[];
  cta: string;
  ctaHref: string;
  ctaVariant: 'primary' | 'secondary' | 'enterprise';
  limits?: {
    vendors?: string;
    comparisons?: string;
    users?: string;
    api?: string;
    history?: string;
  };
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    description: 'Perfect for individual contributors doing vendor research',
    icon: <Zap size={20} />,
    features: [
      { text: 'Live vendor pricing pages', included: true },
      { text: '5 comparisons per month', included: true },
      { text: 'Basic cost calculator', included: true },
      { text: 'View pricing methodology', included: true },
      { text: 'Email support', included: true },
      { text: 'Price change alerts', included: false },
      { text: 'Export to CSV/PDF', included: false },
      { text: 'API access', included: false },
      { text: 'Historical pricing data', included: false },
      { text: 'Custom integrations', included: false },
    ],
    limits: {
      vendors: '30 vendors',
      comparisons: '5/month',
      users: '1 user',
      history: '7 days',
    },
    cta: 'Start Free',
    ctaHref: '#roi-calculator',
    ctaVariant: 'secondary',
  },
  {
    name: 'Pro',
    price: 49,
    yearlyPrice: 39,
    description: 'For RevOps teams managing vendor spend',
    icon: <Shield size={20} />,
    badge: 'MOST POPULAR',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited comparisons', included: true },
      { text: 'Price change alerts', included: true },
      { text: 'Vendor watchlists (25 vendors)', included: true },
      { text: 'Export to CSV/PDF', included: true },
      { text: 'Historical pricing (90 days)', included: true },
      { text: 'API access (1000 calls/mo)', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Budget forecasting', included: true },
      { text: 'Custom integrations', included: false },
    ],
    limits: {
      vendors: '100+ vendors',
      comparisons: 'Unlimited',
      users: 'Up to 5 users',
      api: '1000 calls/mo',
      history: '90 days',
    },
    cta: 'Start Pro Trial',
    ctaHref: '#roi-calculator',
    ctaVariant: 'primary',
  },
  {
    name: 'Enterprise',
    price: -1, // Custom pricing
    yearlyPrice: -1,
    description: 'For procurement teams at scale',
    icon: <Building2 size={20} />,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited API calls', included: true },
      { text: 'SSO & SAML', included: true },
      { text: 'SOC 2 Type II report', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'SLA guarantees', included: true },
      { text: 'Custom data retention', included: true },
      { text: 'White-label options', included: true },
      { text: 'Procurement support', included: true },
    ],
    limits: {
      vendors: 'All vendors',
      comparisons: 'Unlimited',
      users: 'Unlimited users',
      api: 'Unlimited',
      history: 'Custom retention',
    },
    cta: 'Contact Sales',
    ctaHref: 'mailto:sales@saasprice.ai',
    ctaVariant: 'enterprise',
  },
];

const PricingCard: React.FC<{ 
  tier: PricingTier; 
  isYearly: boolean;
  index: number;
}> = ({ tier, isYearly, index }) => {
  const isPopular = tier.badge === 'MOST POPULAR';
  const isEnterprise = tier.name === 'Enterprise';
  
  const displayPrice = isYearly ? tier.yearlyPrice : tier.price;
  const savings = isYearly && tier.price > 0 ? (tier.price - tier.yearlyPrice) * 12 : 0;

  const handleCtaClick = (e: React.MouseEvent) => {
    if (tier.ctaHref.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(tier.ctaHref);
      if (element) {
        const offset = 80; // Account for sticky header
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <div 
      className={`relative rounded-2xl p-8 ${isPopular ? 'scale-105' : ''}`}
      style={{ 
        backgroundColor: colors.white,
        boxShadow: isPopular 
          ? '0 20px 60px rgba(45, 91, 255, 0.15)' 
          : '0 6px 24px rgba(2, 6, 23, 0.06)',
        border: isPopular 
          ? `2px solid ${colors.primary}`
          : `1px solid ${colors.mist200}`
      }}
    >
      {/* Badge */}
      {tier.badge && (
        <div 
          className="absolute -top-3 left-1/2 transform -translate-x-1/2"
        >
          <span 
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ 
              backgroundColor: colors.verifiedBg,
              color: colors.verified
            }}
          >
            {tier.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div 
          className="inline-flex p-2 rounded-lg mb-3"
          style={{ 
            backgroundColor: colors.snow50,
            color: isPopular ? colors.primary : colors.slate600
          }}
        >
          {tier.icon}
        </div>
        
        <h3 
          className="text-xl font-semibold mb-2"
          style={{ color: colors.ink900 }}
        >
          {tier.name}
        </h3>
        
        <p 
          className="text-sm"
          style={{ color: colors.slate600 }}
        >
          {tier.description}
        </p>
      </div>

      {/* Pricing */}
      <div className="text-center mb-6">
        {isEnterprise ? (
          <div>
            <div 
              className="text-3xl font-bold"
              style={{ color: colors.ink900 }}
            >
              Custom
            </div>
            <div 
              className="text-sm mt-1"
              style={{ color: colors.slate600 }}
            >
              Tailored to your needs
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline justify-center gap-1">
              <span 
                className="text-3xl font-bold"
                style={{ 
                  color: colors.ink900,
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                ${displayPrice}
              </span>
              <span 
                className="text-sm"
                style={{ color: colors.slate600 }}
              >
                /month
              </span>
            </div>
            {savings > 0 && (
              <div 
                className="text-xs mt-1"
                style={{ color: colors.success }}
              >
                Save ${savings}/year
              </div>
            )}
          </div>
        )}
      </div>

      {/* Limits */}
      {tier.limits && (
        <div 
          className="mb-6 p-3 rounded-lg"
          style={{ 
            backgroundColor: colors.snow50,
            fontSize: '12px',
            color: colors.slate600
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            {tier.limits.vendors && (
              <div>• {tier.limits.vendors}</div>
            )}
            {tier.limits.comparisons && (
              <div>• {tier.limits.comparisons}</div>
            )}
            {tier.limits.users && (
              <div>• {tier.limits.users}</div>
            )}
            {tier.limits.api && (
              <div>• API: {tier.limits.api}</div>
            )}
          </div>
        </div>
      )}

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {tier.features.slice(0, 8).map((feature, idx) => (
          <li 
            key={idx}
            className="flex items-start gap-2"
          >
            {feature.included ? (
              <Check 
                size={18} 
                className="mt-0.5 flex-shrink-0"
                style={{ color: colors.success }}
              />
            ) : (
              <X 
                size={18} 
                className="mt-0.5 flex-shrink-0"
                style={{ color: colors.mist200 }}
              />
            )}
            <span 
              className="text-sm"
              style={{ 
                color: feature.included ? colors.slate600 : colors.mist200
              }}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {tier.ctaHref.startsWith('mailto:') ? (
        <a
          href={tier.ctaHref}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            tier.ctaVariant === 'primary' 
              ? 'text-white hover:shadow-lg' 
              : tier.ctaVariant === 'enterprise'
              ? 'text-white'
              : ''
          }`}
          style={{ 
            backgroundColor: 
              tier.ctaVariant === 'primary' ? colors.primary :
              tier.ctaVariant === 'enterprise' ? colors.verified :
              colors.white,
            border: tier.ctaVariant === 'secondary' ? `1px solid ${colors.mist200}` : 'none',
            color: tier.ctaVariant === 'secondary' ? colors.ink900 : colors.white
          }}
        >
          {tier.cta}
          <ArrowRight size={18} />
        </a>
      ) : (
        <button
          onClick={handleCtaClick}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            tier.ctaVariant === 'primary' 
              ? 'text-white hover:shadow-lg' 
              : tier.ctaVariant === 'enterprise'
              ? 'text-white'
              : ''
          }`}
          style={{ 
            backgroundColor: 
              tier.ctaVariant === 'primary' ? colors.primary :
              tier.ctaVariant === 'enterprise' ? colors.verified :
              colors.white,
            border: tier.ctaVariant === 'secondary' ? `1px solid ${colors.mist200}` : 'none',
            color: tier.ctaVariant === 'secondary' ? colors.ink900 : colors.white
          }}
          onMouseEnter={(e) => {
            if (tier.ctaVariant === 'primary') {
              e.currentTarget.style.backgroundColor = colors.primaryHover;
            }
          }}
          onMouseLeave={(e) => {
            if (tier.ctaVariant === 'primary') {
              e.currentTarget.style.backgroundColor = colors.primary;
            }
          }}
        >
          {tier.cta}
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
};

const Pricing: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section 
      id="pricing" 
      className="py-20"
      style={{ backgroundColor: colors.white }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 
            className="text-3xl lg:text-4xl font-bold"
            style={{ 
              color: colors.ink900,
              letterSpacing: '-0.01em'
            }}
          >
            Simple, transparent pricing
          </h2>
          <p 
            className="mt-3 text-lg"
            style={{ color: colors.slate600 }}
          >
            Start free. Scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span 
              className={`text-sm font-medium`}
              style={{ 
                color: !isYearly ? colors.ink900 : colors.slate600
              }}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors"
              style={{ 
                backgroundColor: isYearly ? colors.primary : colors.mist200
              }}
            >
              <span 
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-7' : 'translate-x-1'
                }`}
                style={{ 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
            </button>
            <span 
              className={`text-sm font-medium`}
              style={{ 
                color: isYearly ? colors.ink900 : colors.slate600
              }}
            >
              Yearly
              {isYearly && (
                <span 
                  className="ml-2 px-2 py-0.5 rounded text-xs"
                  style={{ 
                    backgroundColor: colors.successBg,
                    color: colors.success
                  }}
                >
                  Save 20%
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {pricingTiers.map((tier, index) => (
            <PricingCard 
              key={tier.name}
              tier={tier}
              isYearly={isYearly}
              index={index}
            />
          ))}
        </div>

        {/* FAQ Link */}
        <div 
          className="mt-12 text-center p-6 rounded-xl"
          style={{ 
            backgroundColor: colors.snow50,
            border: `1px solid ${colors.mist200}`
          }}
        >
          <p 
            className="text-sm"
            style={{ color: colors.slate600 }}
          >
            Questions about pricing? Check our{' '}
            <a 
              href="#faq" 
              className="font-medium underline"
              style={{ color: colors.primary }}
            >
              frequently asked questions
            </a>
            {' '}or{' '}
            <a 
              href="mailto:sales@saasprice.ai" 
              className="font-medium underline"
              style={{ color: colors.primary }}
            >
              contact sales
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;