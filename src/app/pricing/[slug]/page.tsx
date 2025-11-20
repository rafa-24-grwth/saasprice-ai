// src/app/pricing/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getVendorWithPricing, getAllVendors } from '@/lib/services/vendor.service';
import { formatCurrency } from '@/utils/format';
import type { Vendor, Plan, PriceFact } from '@/types/database';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function VendorPricingPage({ params }: PageProps) {
  const vendorData = await getVendorWithPricing(params.slug);

  if (!vendorData) {
    notFound();
  }

  const { vendor, plans } = vendorData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Vendor Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            {vendor.logo_url && (
              <img 
                src={vendor.logo_url} 
                alt={`${vendor.name} logo`}
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
              <p className="text-gray-600">{vendor.category}</p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-4">
            <Link 
              href="/compare"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Compare with other vendors →
            </Link>
            {vendor.pricing_url && (
              <a 
                href={vendor.pricing_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View official pricing →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Available Plans</h2>
        
        <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* No plans message */}
        {plans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No pricing plans available for this vendor yet.</p>
            <Link 
              href="/compare"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
            >
              Browse other vendors
            </Link>
          </div>
        )}
      </div>

      {/* Data Quality Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-800">
                Pricing data is based on public list prices and updated nightly. 
                Enterprise discounts and negotiated rates are not included.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fixed PricingCard component with correct field names
function PricingCard({ plan }: { plan: Plan & { prices: PriceFact[] } }) {
  // Get the first price or show unavailable
  const monthlyPrice = plan.prices.find(p => p.cadence === 'monthly');
  const annualPrice = plan.prices.find(p => p.cadence === 'annual' || p.cadence === 'yearly');
  const displayPrice = monthlyPrice || annualPrice;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
        {plan.tier && (
          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">
            {plan.tier}
          </span>
        )}
      </div>

      {displayPrice ? (
        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(displayPrice.base_price || 0)}
            </span>
            <span className="ml-2 text-gray-500">
              /{displayPrice.cadence}
            </span>
          </div>
          
          {/* Using unit_price for per-seat pricing */}
          {displayPrice.unit_price && displayPrice.unit_price > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              + {formatCurrency(displayPrice.unit_price)} per {displayPrice.unit_type || 'seat'}
            </p>
          )}
          
          {/* Using overage_price as alternative for additional units */}
          {displayPrice.overage_price && displayPrice.overage_price > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              Overage: {formatCurrency(displayPrice.overage_price)} per additional {displayPrice.unit_type || 'unit'}
            </p>
          )}
          
          {/* Using included_units for included seats */}
          {displayPrice.included_units && displayPrice.included_units > 0 && (
            <p className="text-sm text-gray-600">
              Includes {displayPrice.included_units} {displayPrice.unit_type || 'seats'}
            </p>
          )}

          {/* Show minimum commitment if exists */}
          {displayPrice.minimum_commitment && displayPrice.minimum_commitment > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Minimum commitment: {formatCurrency(displayPrice.minimum_commitment)}
            </p>
          )}

          {/* Show confidence score for data quality transparency */}
          {displayPrice.confidence_score && (
            <div className="mt-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Confidence:</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-[60px]">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${displayPrice.confidence_score * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round(displayPrice.confidence_score * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-gray-500">Pricing unavailable</p>
        </div>
      )}

      <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        Select Plan
      </button>
    </div>
  );
}

// Generate static params for all vendors
export async function generateStaticParams() {
  try {
    const vendors = await getAllVendors();
    return vendors.map((vendor) => ({
      slug: vendor.slug,
    }));
  } catch (error) {
    console.warn('Could not fetch vendors for static generation:', error);
    // Return empty array to allow build to succeed
    // Pages will be generated on-demand instead
    return [];
  }
}

// Make this page dynamic so it can handle on-demand requests
export const dynamic = 'force-dynamic';
export const dynamicParams = true;