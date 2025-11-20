'use client';

// components/landing/ProductPillars.tsx
import React, { useState } from 'react';
import { Database, Eye, TrendingUp, ChevronDown, CheckCircle2, AlertTriangle, BarChart3 } from 'lucide-react';

const colors = {
  ink900: '#0B1220',
  slate600: '#475569',
  snow50: '#F7F9FC',
  info: '#06B6D4',
  infoBg: '#E0F2FE',
  primary: '#2D5BFF',
  primaryHover: '#2449CC',
  success: '#10B981',
  mist200: '#E5EAF2',
  white: '#FFFFFF',
  verified: '#7C3AED',
  verifiedBg: '#F4EFFE',
};

interface Pillar {
  icon: React.ReactNode;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  features: string[];
  badge?: string;
  badgeColor?: string;
}

const pillars: Pillar[] = [
  {
    icon: <Database size={24} strokeWidth={1.5} />,
    title: "Real-Time Price Tracking",
    description: "Daily updates across 100+ vendors with freshness tags and confidence scores",
    metric: "< 24h",
    metricLabel: "data freshness",
    badge: "VERIFIED",
    badgeColor: colors.verified,
    features: [
      "Automated daily scraping",
      "Price change detection (≥5%)",
      "Historical price tracking",
      "Multi-method validation"
    ]
  },
  {
    icon: <Eye size={24} strokeWidth={1.5} />,
    title: "Smart Comparisons",
    description: "Normalized pricing at your exact headcount—no spreadsheet gymnastics",
    metric: "60 sec",
    metricLabel: "to full analysis",
    features: [
      "Seat-based normalization",
      "Usage tier calculations",
      "Annual vs monthly conversion",
      "Hidden cost detection"
    ]
  },
  {
    icon: <TrendingUp size={24} strokeWidth={1.5} />,
    title: "Budget Intelligence",
    description: "Identify overspend, recommend optimal plans, and document savings",
    metric: "$2,450",
    metricLabel: "avg monthly savings",
    badge: "ROI",
    badgeColor: colors.success,
    features: [
      "Vendor overlap analysis",
      "Rightsizing recommendations",
      "Budget forecasting",
      "Savings documentation"
    ]
  }
];

const PillarCard: React.FC<{ pillar: Pillar }> = ({ pillar }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article 
      className="group relative rounded-2xl bg-white p-7 transition-all hover:scale-[1.02]"
      style={{ 
        backgroundColor: colors.white,
        boxShadow: '0 6px 24px rgba(2, 6, 23, 0.06)',
        border: `1px solid ${colors.mist200}`
      }}
    >
      {/* Badge */}
      {pillar.badge && (
        <span 
          className="absolute -top-3 right-6 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ 
            backgroundColor: pillar.badgeColor === colors.success ? colors.infoBg : colors.verifiedBg,
            color: pillar.badgeColor || colors.verified
          }}
        >
          {pillar.badge}
        </span>
      )}

      {/* Icon */}
      <div 
        className="mb-4 inline-flex p-2 rounded-lg"
        style={{ 
          backgroundColor: colors.snow50,
          color: colors.primary 
        }}
      >
        {pillar.icon}
      </div>
      
      {/* Title */}
      <h3 
        className="text-lg font-semibold"
        style={{ color: colors.ink900 }}
      >
        {pillar.title}
      </h3>
      
      {/* Description */}
      <p 
        className="mt-2 text-sm leading-relaxed"
        style={{ color: colors.slate600 }}
      >
        {pillar.description}
      </p>
      
      {/* Metric */}
      <div className="mt-4 flex items-baseline gap-2">
        <span 
          className="text-2xl font-bold"
          style={{ 
            color: colors.ink900,
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {pillar.metric}
        </span>
        <span 
          className="text-sm"
          style={{ color: colors.slate600 }}
        >
          {pillar.metricLabel}
        </span>
      </div>
      
      {/* Expandable Features */}
      <details 
        className="mt-4 group/details"
        onToggle={(e) => setIsExpanded((e.target as HTMLDetailsElement).open)}
      >
        <summary 
          className="flex items-center gap-1 text-xs font-medium cursor-pointer list-none transition-colors"
          style={{ color: colors.primary }}
        >
          View capabilities
          <ChevronDown 
            size={14} 
            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </summary>
        
        <ul className="mt-3 space-y-2">
          {pillar.features.map((feature, idx) => (
            <li 
              key={idx}
              className="flex items-start gap-2 text-xs"
              style={{ color: colors.slate600 }}
            >
              <CheckCircle2 
                size={14} 
                className="mt-0.5 flex-shrink-0"
                style={{ color: colors.success }}
              />
              {feature}
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
};

const ProductPillars: React.FC = () => {
  return (
    <section 
      id="product" 
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
            Institutional-grade pricing clarity
          </h2>
          <p 
            className="mt-3 text-lg"
            style={{ color: colors.slate600 }}
          >
            Precise. Verified. Auditable.
          </p>
        </div>
        
        {/* Pillars Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => (
            <PillarCard key={idx} pillar={pillar} />
          ))}
        </div>
        
        {/* Trust Indicators */}
        <div 
          className="mt-12 p-6 rounded-xl text-center"
          style={{ 
            backgroundColor: colors.snow50,
            border: `1px solid ${colors.mist200}`
          }}
        >
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} style={{ color: colors.success }} />
              <span className="text-sm font-medium" style={{ color: colors.slate600 }}>
                SOC 2 Ready
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 size={20} style={{ color: colors.primary }} />
              <span className="text-sm font-medium" style={{ color: colors.slate600 }}>
                99% Accuracy Rate
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} style={{ color: colors.info }} />
              <span className="text-sm font-medium" style={{ color: colors.slate600 }}>
                Source Transparency
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductPillars;