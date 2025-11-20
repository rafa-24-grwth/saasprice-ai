'use client';

import { useState } from 'react';
import { 
  VerificationBadge, 
  FreshnessStamp, 
  ConfidenceIndicator,
  MethodologyPopover
} from '@/components/shared/trust';

// Force dynamic rendering to avoid build-time Supabase client initialization
export const dynamic = 'force-dynamic';
import { ArrowUpRight, TrendingUp, TrendingDown, Minus, AlertCircle, Search, SlidersHorizontal } from 'lucide-react';

const vendors = [
  {
    id: 'datadog',
    name: 'Datadog',
    plan: 'Pro',
    logoUrl: '/logos/datadog.svg', // You'd add actual logos
    price: 23,
    unit: 'host',
    verification: 'API_VERIFIED',
    confidence: 0.98,
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    sourceCount: 7,
    sourceAgreement: 7,
    trend: +5,
    isLive: false
  },
  {
    id: 'vercel',
    name: 'Vercel',
    plan: 'Pro',
    logoUrl: '/logos/vercel.svg',
    price: 20,
    unit: 'user',
    verification: 'API_VERIFIED',
    confidence: 0.99,
    lastUpdated: new Date(),
    sourceCount: 5,
    sourceAgreement: 5,
    trend: 0,
    isLive: true
  },
  {
    id: 'newrelic',
    name: 'New Relic',
    plan: 'Standard',
    logoUrl: '/logos/newrelic.svg',
    price: 25,
    unit: 'user',
    verification: 'MONITORED',
    confidence: 0.82,
    lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000),
    sourceCount: 4,
    sourceAgreement: 3,
    trend: 0,
    isLive: false
  },
  {
    id: 'splunk',
    name: 'Splunk',
    plan: 'Enterprise',
    logoUrl: '/logos/splunk.svg',
    price: 45,
    unit: 'GB',
    verification: 'SELF_REPORTED',
    confidence: 0.45,
    lastUpdated: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    sourceCount: 1,
    sourceAgreement: 1,
    trend: -2,
    isLive: false,
    hasWarning: true
  }
];

export default function PremiumDashboard() {
  const [selectedId, setSelectedId] = useState<string>('vercel');
  const [viewMode, setViewMode] = useState<'focus' | 'grid'>('focus');
  const selected = vendors.find(v => v.id === selectedId);

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Very subtle grid */}
      <div 
        className="fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.02) 100%)`,
        }}
      />

      {/* Header Bar */}
      <header className="relative z-20 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-sm font-medium text-white">Pricing Intelligence</h1>
            <span className="text-xs text-white/40">Real-time monitoring</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white transition-colors">
              <Search className="w-3.5 h-3.5" />
              Search
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white transition-colors">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
            </button>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center rounded-md bg-white/[0.03] border border-white/[0.06] p-0.5">
              <button
                onClick={() => setViewMode('focus')}
                className={`px-3 py-1 text-xs rounded transition-all ${
                  viewMode === 'focus' 
                    ? 'bg-white text-black font-medium' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Focus
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-xs rounded transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-black font-medium' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Grid
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {viewMode === 'focus' ? (
          <div className="grid grid-cols-12 gap-6">
            {/* Vendor Selector - Minimal */}
            <div className="col-span-3 space-y-2">
              {vendors.map((vendor) => (
                <button
                  key={vendor.id}
                  onClick={() => setSelectedId(vendor.id)}
                  className={`
                    w-full px-4 py-3 rounded-xl border transition-all duration-200
                    ${selectedId === vendor.id 
                      ? 'bg-white text-black border-transparent' 
                      : 'bg-white/[0.02] text-white border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.08]'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Logo placeholder - replace with actual logos */}
                      <div className={`w-5 h-5 rounded ${
                        selectedId === vendor.id ? 'bg-black/10' : 'bg-white/10'
                      }`} />
                      <div className="text-left">
                        <div className="font-medium text-sm">{vendor.name}</div>
                        <div className={`text-xs ${
                          selectedId === vendor.id ? 'text-black/50' : 'text-white/40'
                        }`}>
                          ${vendor.price}/{vendor.unit}
                        </div>
                      </div>
                    </div>
                    {vendor.isLive && (
                      <div className="relative">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <div className="absolute inset-0 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Main Detail Panel */}
            <div className="col-span-9">
              {selected && (
                <div className="relative">
                  {/* Very subtle glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-white/[0.03] to-transparent rounded-2xl blur-xl" />
                  
                  <div className="relative bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden">
                    {/* Header Section */}
                    <div className="p-8 border-b border-white/[0.06]">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                            {/* Logo placeholder */}
                            <div className="w-10 h-10 bg-white/10 rounded-lg" />
                            <div>
                              <h2 className="text-2xl font-light text-white">{selected.name}</h2>
                              <p className="text-sm text-white/40">{selected.plan} Plan</p>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extralight text-white">
                              ${selected.price}
                            </span>
                            <span className="text-white/40">per {selected.unit}/month</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {selected.trend !== 0 && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                              selected.trend > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'
                            }`}>
                              {selected.trend > 0 ? (
                                <TrendingUp className="w-3 h-3 text-red-400" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-emerald-400" />
                              )}
                              <span className={`text-xs ${
                                selected.trend > 0 ? 'text-red-400' : 'text-emerald-400'
                              }`}>
                                {selected.trend > 0 ? '+' : ''}{selected.trend}%
                              </span>
                            </div>
                          )}
                          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <ArrowUpRight className="w-4 h-4 text-white/60" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="p-8 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-black/20 border border-white/[0.04]">
                          <div className="text-xs text-white/40 mb-2">Verification</div>
                          <VerificationBadge level={selected.verification as any} size="sm" />
                        </div>
                        
                        <div className="p-4 rounded-xl bg-black/20 border border-white/[0.04]">
                          <div className="text-xs text-white/40 mb-2">Last Updated</div>
                          {selected.isLive ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                              <span className="text-sm text-emerald-400 font-medium">Live</span>
                            </div>
                          ) : (
                            <FreshnessStamp 
                              updatedAt={selected.lastUpdated}
                              sourceCount={selected.sourceCount}
                              majorityMatch={selected.sourceAgreement}
                              size="sm"
                            />
                          )}
                        </div>
                        
                        <div className="p-4 rounded-xl bg-black/20 border border-white/[0.04]">
                          <div className="text-xs text-white/40 mb-2">Confidence</div>
                          <ConfidenceIndicator value={selected.confidence} size="sm" />
                        </div>
                      </div>

                      {selected.hasWarning && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          <span className="text-xs text-amber-400">Data may be outdated</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-4 border-t border-white/[0.06] flex items-center justify-between">
                      <MethodologyPopover variant="text" size="sm" />
                      <button className="text-xs text-white/40 hover:text-white transition-colors">
                        Export data →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vendor) => (
              <div 
                key={vendor.id}
                className="bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/[0.06] p-6 hover:bg-white/[0.03] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg" />
                    <div>
                      <h3 className="text-sm font-medium text-white">{vendor.name}</h3>
                      <p className="text-xs text-white/40">{vendor.plan}</p>
                    </div>
                  </div>
                  {vendor.isLive && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  )}
                </div>
                
                <div className="mb-4">
                  <span className="text-2xl font-light text-white">${vendor.price}</span>
                  <span className="text-xs text-white/40 ml-1">/{vendor.unit}</span>
                </div>
                
                <div className="space-y-2 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <VerificationBadge level={vendor.verification as any} size="sm" />
                    <ConfidenceIndicator value={vendor.confidence} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}