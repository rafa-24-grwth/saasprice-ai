// src/components/compare/CompareForm.tsx
// Fixed version with correct import paths

'use client';

import { useState, useCallback, useMemo } from 'react';
// Fix the import path - your database.ts is in src/types/
import { Vendor, Plan, PriceFact } from '../../types/database';
// OR use relative import if @ alias isn't working:
// import { Vendor, Plan, PriceFact } from '../../types/database';

import ComparisonResults from './ComparisonResults';
import VendorSelector from './VendorSelector';

interface CompareFormProps {
  vendors: Vendor[];
}

export interface ComparisonParams {
  vendorA: Vendor | null;
  vendorB: Vendor | null;
  seats: number;
  billingPeriod: 'monthly' | 'annual';
}

export default function CompareForm({ vendors }: CompareFormProps) {
  const [vendorA, setVendorA] = useState<Vendor | null>(null);
  const [vendorB, setVendorB] = useState<Vendor | null>(null);
  const [seats, setSeats] = useState<number>(10);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [showResults, setShowResults] = useState(false);

  // Validation
  const canCompare = useMemo(() => {
    return vendorA && vendorB && vendorA.id !== vendorB.id && seats > 0;
  }, [vendorA, vendorB, seats]);

  // Handle comparison
  const handleCompare = useCallback(() => {
    if (canCompare) {
      setShowResults(true);
    }
  }, [canCompare]);

  // Reset form
  const handleReset = useCallback(() => {
    setShowResults(false);
    setVendorA(null);
    setVendorB(null);
    setSeats(10);
    setBillingPeriod('monthly');
  }, []);

  return (
    <div className="space-y-8">
      {!showResults ? (
        <>
          {/* Vendor Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-sp-text-primary">
                First Vendor
              </label>
              <VendorSelector
                vendors={vendors}
                selectedVendor={vendorA}
                onSelect={setVendorA}
                excludeVendor={vendorB}
                placeholder="Select first vendor..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-sp-text-primary">
                Second Vendor
              </label>
              <VendorSelector
                vendors={vendors}
                selectedVendor={vendorB}
                onSelect={setVendorB}
                excludeVendor={vendorA}
                placeholder="Select second vendor..."
              />
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-sp-surface-1 rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-semibold text-sp-text-primary">
              Configure Your Comparison
            </h3>

            {/* Seat Count */}
            <div className="space-y-2">
              <label htmlFor="seats" className="block text-sm font-medium text-sp-text-primary">
                Number of Seats
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="seats"
                  type="number"
                  min="1"
                  max="10000"
                  value={seats}
                  onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-32 px-3 py-2 bg-sp-surface-2 text-sp-text-primary rounded-md 
                           border border-sp-border focus:outline-none focus:ring-2 
                           focus:ring-sp-accent focus:border-transparent"
                />
                <div className="flex gap-2">
                  {[5, 10, 25, 50, 100].map((count) => (
                    <button
                      key={count}
                      onClick={() => setSeats(count)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        seats === count
                          ? 'bg-sp-accent text-white'
                          : 'bg-sp-surface-2 text-sp-text-secondary hover:bg-sp-surface-2/80'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Billing Period */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-sp-text-primary">
                Billing Period
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    billingPeriod === 'monthly'
                      ? 'bg-sp-accent text-white'
                      : 'bg-sp-surface-2 text-sp-text-secondary hover:bg-sp-surface-2/80'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('annual')}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    billingPeriod === 'annual'
                      ? 'bg-sp-accent text-white'
                      : 'bg-sp-surface-2 text-sp-text-secondary hover:bg-sp-surface-2/80'
                  }`}
                >
                  Annual
                  <span className="ml-2 text-xs opacity-80">Save ~20%</span>
                </button>
              </div>
            </div>
          </div>

          {/* Compare Button */}
          <div className="flex justify-center">
            <button
              onClick={handleCompare}
              disabled={!canCompare}
              className={`px-8 py-3 rounded-md font-semibold transition-all ${
                canCompare
                  ? 'bg-sp-accent text-white hover:bg-sp-accent-hover shadow-lg'
                  : 'bg-sp-surface-2 text-sp-text-muted cursor-not-allowed'
              }`}
            >
              {canCompare ? 'Compare Pricing' : 'Select two vendors to compare'}
            </button>
          </div>

          {/* Info box */}
          <div className="bg-sp-surface-1 border border-sp-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-sp-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-sp-text-secondary">
                <p className="mb-2">
                  Our normalized pricing shows the <strong>true monthly cost per seat</strong>, 
                  accounting for annual discounts and common overages.
                </p>
                <p>
                  All prices are based on public list pricing. Enterprise discounts 
                  and negotiated rates are not included.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : showResults && vendorA && vendorB ? (
        <>
          {/* Results */}
          <ComparisonResults
            vendorA={vendorA}
            vendorB={vendorB}
            seats={seats}
            billingPeriod={billingPeriod}
          />

          {/* New Comparison Button */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-sp-surface-2 text-sp-text-primary rounded-md 
                       hover:bg-sp-surface-2/80 transition-colors"
            >
              New Comparison
            </button>
            <button
              onClick={() => setShowResults(false)}
              className="px-6 py-2 bg-sp-accent text-white rounded-md 
                       hover:bg-sp-accent-hover transition-colors"
            >
              Adjust Parameters
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}