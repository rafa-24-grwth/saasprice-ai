'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Plus,
  Download,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Users,
  Shield,
  Star,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import TrendChart from '@/components/dashboard/TrendChart';
import { formatDistanceToNow } from 'date-fns';

// Types
interface PriceTier {
  id: string;
  name: string;
  tier: 'basic' | 'pro' | 'enterprise' | 'custom';
  price: number | null;
  billing_period: 'monthly' | 'annual';
  features: string[];
  included_units?: number;
  unit_type?: string;
}

interface VendorDetails {
  id: string;
  name: string;
  logo_url?: string;
  website?: string;
  category?: string;
  description?: string;
  last_updated: string;
  confidence_score: number;
  is_verified: boolean;
  pricing_tiers: PriceTier[];
  similar_vendors: Array<{
    id: string;
    name: string;
    logo_url?: string;
    starting_price?: number;
  }>;
  price_history?: Array<{
    date: Date;
    price: number;
    tier: string;
  }>;
}

// Pricing Card Component
function PricingCard({ tier, isPopular = false }: { tier: PriceTier; isPopular?: boolean }) {
  const tierColors = {
    basic: 'border-gray-200',
    pro: 'border-blue-500 shadow-md',
    enterprise: 'border-purple-500',
    custom: 'border-gray-300'
  };

  const tierIcons = {
    basic: Users,
    pro: Star,
    enterprise: Shield,
    custom: DollarSign
  };

  const Icon = tierIcons[tier.tier] || Users;

  return (
    <div className={cn(
      "relative bg-white rounded-xl border-2 p-6 hover:shadow-lg transition-all",
      tierColors[tier.tier],
      isPopular && "scale-105"
    )}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            MOST POPULAR
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold capitalize">{tier.name}</h3>
        </div>
      </div>

      <div className="mb-6">
        {tier.price !== null ? (
          <div>
            <span className="text-3xl font-bold">${tier.price}</span>
            <span className="text-gray-500">/{tier.billing_period === 'annual' ? 'year' : 'month'}</span>
            {tier.included_units && (
              <p className="text-sm text-gray-500 mt-1">
                {tier.included_units} {tier.unit_type || 'users'} included
              </p>
            )}
          </div>
        ) : (
          <div className="text-2xl font-semibold text-gray-600">Custom Pricing</div>
        )}
      </div>

      <ul className="space-y-2 mb-6">
        {tier.features.slice(0, 5).map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
        {tier.features.length > 5 && (
          <li className="text-sm text-gray-500">
            +{tier.features.length - 5} more features
          </li>
        )}
      </ul>

      <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
        View Details
      </button>
    </div>
  );
}

// Main Vendor Details Page
export default function VendorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;
  
  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pricing' | 'features' | 'history'>('pricing');
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (vendorId) {
      fetchVendorDetails();
    }
  }, [vendorId]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendors/${vendorId}`);
      const data = await response.json();
      
      if (response.ok) {
        setVendor(data);
      } else {
        console.error('Failed to fetch vendor details');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/vendor/${vendorId}/scrape`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok) {
        // Wait a bit then refresh the data
        setTimeout(() => {
          fetchVendorDetails();
          setRefreshing(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error triggering scrape:', error);
      setRefreshing(false);
    }
  };

  const handleAddToWatchlist = () => {
    setIsInWatchlist(!isInWatchlist);
    // TODO: Call API to add/remove from watchlist
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="h-64 bg-white rounded-xl mb-8" />
            <div className="grid grid-cols-3 gap-6">
              <div className="h-96 bg-white rounded-xl" />
              <div className="h-96 bg-white rounded-xl" />
              <div className="h-96 bg-white rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Vendor not found</h2>
          <Link href="/vendors" className="text-blue-600 hover:underline">
            Back to vendors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Link 
                href="/vendors"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div className="flex items-start gap-4">
                {vendor.logo_url ? (
                  <img 
                    src={vendor.logo_url} 
                    alt={vendor.name}
                    className="w-16 h-16 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 font-semibold">
                      {vendor.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
                  {vendor.category && (
                    <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      {vendor.category}
                    </span>
                  )}
                  {vendor.description && (
                    <p className="mt-2 text-gray-600 max-w-2xl">{vendor.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToWatchlist}
                className={cn(
                  "px-4 py-2 rounded-lg flex items-center gap-2 transition-colors",
                  isInWatchlist 
                    ? "bg-blue-100 text-blue-600" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                )}
              >
                <Eye className="w-4 h-4" />
                {isInWatchlist ? 'Watching' : 'Watch'}
              </button>

              <Link
                href={`/compare?vendors=${vendorId}`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Compare
              </Link>

              {vendor.website && (
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Website
                </a>
              )}
            </div>
          </div>

          {/* Metadata Bar */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                vendor.confidence_score >= 80 ? "bg-green-500" : 
                vendor.confidence_score >= 60 ? "bg-yellow-500" : "bg-red-500"
              )} />
              <span className="text-sm text-gray-600">
                {vendor.confidence_score}% confidence
              </span>
            </div>

            {vendor.is_verified && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">API Verified</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Updated {formatDistanceToNow(new Date(vendor.last_updated), { addSuffix: true })}
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={cn(
                "ml-auto flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700",
                refreshing && "opacity-50 cursor-not-allowed"
              )}
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
              {refreshing ? 'Refreshing...' : 'Refresh data'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {['pricing', 'features', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors",
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'pricing' && (
          <div className="space-y-8">
            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendor.pricing_tiers.map((tier, idx) => (
                <PricingCard 
                  key={tier.id} 
                  tier={tier}
                  isPopular={tier.tier === 'pro'}
                />
              ))}
            </div>

            {/* Similar Vendors */}
            {vendor.similar_vendors && vendor.similar_vendors.length > 0 && (
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Similar Vendors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {vendor.similar_vendors.map((similar) => (
                    <Link
                      key={similar.id}
                      href={`/vendors/${similar.id}`}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {similar.logo_url && (
                          <img 
                            src={similar.logo_url} 
                            alt={similar.name}
                            className="w-8 h-8 object-contain"
                          />
                        )}
                        <span className="font-medium text-sm">{similar.name}</span>
                      </div>
                      {similar.starting_price && (
                        <p className="text-sm text-gray-600">
                          From ${similar.starting_price}/mo
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'features' && (
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Feature Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    {vendor.pricing_tiers.map(tier => (
                      <th key={tier.id} className="text-center py-3 px-4 capitalize">
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Collect all unique features */}
                  {Array.from(new Set(
                    vendor.pricing_tiers.flatMap(t => t.features)
                  )).map((feature, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-3 px-4 text-sm">{feature}</td>
                      {vendor.pricing_tiers.map(tier => (
                        <td key={tier.id} className="text-center py-3 px-4">
                          {tier.features.includes(feature) ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Price History</h3>
            {vendor.price_history && vendor.price_history.length > 0 ? (
              <TrendChart
                datasets={[{
                  vendorName: vendor.name,
                  tier: 'all',
                  dataPoints: vendor.price_history.map(p => ({
                    date: p.date,
                    price: p.price,
                    confidence: vendor.confidence_score / 100,
                    source: 'historical'
                  }))
                }]}
                height={400}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No price history available yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}