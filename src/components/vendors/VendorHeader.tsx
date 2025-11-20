// src/components/vendor/VendorHeader.tsx
import type { Database } from '@/types/database';

type Vendor = Database['public']['Tables']['vendors']['Row'];

interface VendorHeaderProps {
  vendor: Vendor;
}

export function VendorHeader({ vendor }: VendorHeaderProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {vendor.name} Pricing
            </h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              <span className="inline-flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" 
                  />
                </svg>
                {vendor.category}
              </span>
              {/* Fixed: Added null check for vendor.priority */}
              {vendor.priority !== null && vendor.priority <= 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Priority Vendor
                </span>
              )}
              {vendor.is_quarantined && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Data Under Review
                </span>
              )}
            </div>
          </div>
          {/* Fixed: Check if pricing_url exists before rendering the link */}
          {vendor.pricing_url && (
            <a
              href={vendor.pricing_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Official Pricing
              <svg className="ml-2 -mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}