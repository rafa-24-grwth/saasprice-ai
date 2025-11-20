'use client';

// components/landing/HeroSection.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Shield, Clock } from 'lucide-react';
import { Button } from '../ui/button';

// Using inline colors since theme import might not be working
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
};

const LAST_UPDATED = '2025-10-13';

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', year: '2-digit' });
};

// Simple StatCard for landing page
const LandingStatCard: React.FC<{
  label: string;
  value: string;
  freshness?: string;
  accent?: 'green' | 'blue' | 'purple';
  footnote?: string;
}> = ({ label, value, freshness, accent, footnote }) => {
  const getAccentColor = () => {
    switch (accent) {
      case 'green':
        return colors.success;
      case 'blue':
        return colors.primary;
      default:
        return colors.ink900;
    }
  };

  return (
    <div 
      className="rounded-2xl bg-white p-6"
      style={{ 
        backgroundColor: colors.white,
        boxShadow: '0 6px 24px rgba(2, 6, 23, 0.06)'
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div 
            className="text-3xl font-bold"
            style={{ 
              color: getAccentColor(),
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {value}
          </div>
          <div 
            className="mt-1 text-sm"
            style={{ color: colors.slate600 }}
          >
            {label}
          </div>
          {footnote && (
            <div 
              className="mt-1 text-xs"
              style={{ color: colors.slate600 }}
            >
              {footnote}
            </div>
          )}
        </div>
        {freshness && (
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
            style={{ 
              backgroundColor: colors.infoBg,
              color: colors.info
            }}
          >
            <span 
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: colors.info }}
            />
            Updated {freshness}
          </span>
        )}
      </div>
    </div>
  );
};

const HeroSection: React.FC = () => {
  const [vendorCount] = useState(127);
  const [comparisons, setComparisons] = useState(8432);
  const countRef = useRef<HTMLDivElement>(null);
  const hasCounted = useRef(false);
  const rafId = useRef<number | null>(null);
  
  useEffect(() => {
    if (!countRef.current || hasCounted.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        hasCounted.current = true;
        
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setComparisons(8432);
          observer.disconnect();
          return;
        }
        
        let current = 8000;
        const end = 8432;
        const step = () => {
          current = Math.min(end, current + Math.ceil((end - 8000) / 60));
          setComparisons(current);
          if (current < end) rafId.current = requestAnimationFrame(step);
        };
        rafId.current = requestAnimationFrame(step);
        observer.disconnect();
      },
      { threshold: 0.5 }
    );
    
    observer.observe(countRef.current);
    return () => {
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <section 
      id="main" 
      tabIndex={-1} 
      className="py-16 lg:py-20"
      style={{ backgroundColor: colors.snow50 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left side - Content */}
          <div>
            <h1 
              className="text-5xl lg:text-6xl font-bold leading-tight"
              style={{ 
                color: colors.ink900,
                letterSpacing: '-0.01em'
              }}
            >
              Stop guessing at SaaS costs. Start knowing.
            </h1>
            <p 
              className="mt-6 text-lg leading-relaxed"
              style={{ color: colors.slate600 }}
            >
              Live, normalized pricing with daily refresh and evidence you can cite. 
              Model the true monthly cost at your headcount in under a minute.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                className="px-7 py-3.5 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                style={{ 
                  backgroundColor: colors.primary,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primaryHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
                data-analytics="cta_hero_run_free_audit"
              >
                Run Free Audit
                <ArrowRight size={20} />
              </button>
              
              <button
                className="px-7 py-3.5 rounded-lg font-medium transition-all"
                style={{ 
                  backgroundColor: colors.white,
                  color: colors.ink900,
                  border: `1px solid ${colors.mist200}`,
                }}
                onClick={() => window.location.href = '#product'}
                data-analytics="cta_hero_try_comparison"
              >
                Try a Comparison
              </button>
            </div>
            
            <ul 
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
              style={{ color: colors.slate600 }}
            >
              <li className="flex items-center gap-1.5">
                <Shield size={16} strokeWidth={1.5} /> 
                Read-only access
              </li>
              <li className="flex items-center gap-1.5">
                <Clock size={16} strokeWidth={1.5} /> 
                5-minute setup
              </li>
              <li>
                <span 
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ 
                    backgroundColor: colors.infoBg,
                    color: colors.info
                  }}
                >
                  <span 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: colors.info }}
                  />
                  Data updated {formatDate(LAST_UPDATED)}
                </span>
              </li>
            </ul>
          </div>
          
          {/* Right side - Stats */}
          <div className="grid gap-4" ref={countRef}>
            <div aria-live="polite" className="sr-only">
              {comparisons} comparisons made
            </div>
            <LandingStatCard 
              label="Vendors tracked" 
              value={vendorCount.toString()} 
              freshness="2h ago" 
            />
            <div className="grid grid-cols-2 gap-4">
              <LandingStatCard 
                label="Comparisons made" 
                value={comparisons.toLocaleString()} 
                footnote="This month" 
              />
              <LandingStatCard 
                label="Avg. savings/team" 
                value="$2,450" 
                accent="green" 
                footnote="Per month" 
              />
            </div>
          </div>
        </div>
        
        <p 
          className="mt-20 text-center text-sm font-medium"
          style={{ color: colors.slate600 }}
        >
          Know the cost. Show your work.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;