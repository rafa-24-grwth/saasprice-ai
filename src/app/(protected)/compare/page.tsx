// app/(protected)/compare/page.tsx
// Main comparison page with vendor selection and comparison display

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useComparison } from '@/hooks/useComparison';
import VendorSelector from '@/components/comparison/VendorSelector';
import ComparisonChart from '@/components/comparison/ComparisonChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import { 
  X, 
  Plus, 
  Download, 
  Share2, 
  Save, 
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vendor } from '@/types/database';

// Simple toast replacement if sonner is not available
function toast(type: 'success' | 'error', message: string) {
  const toastEl = document.createElement('div');
  toastEl.className = cn(
    'fixed bottom-4 right-4 z-50 rounded-lg px-6 py-3 shadow-lg transition-all',
    type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
  );
  toastEl.textContent = message;
  document.body.appendChild(toastEl);
  
  setTimeout(() => {
    toastEl.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toastEl), 300);
  }, 3000);
}

function ComparePageContent() {
  const {
    selectedVendors,
    comparisonData,
    isLoading,
    error,
    canAddMore,
    vendorCount,
    maxVendors,
    addVendor,
    removeVendor,
    clearComparison,
    saveComparison,
    exportComparison,
    generateShareLink,
    refetch
  } = useComparison();

  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [activeView, setActiveView] = useState<'table' | 'chart'>('table');
  
  // State for vendors list
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  
  // Fetch vendors on mount
  useEffect(() => {
    setVendorsLoading(true);
    fetch('/api/vendors')
      .then(res => res.json())
      .then(data => {
        setVendors(data.vendors || []);
        setVendorsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch vendors:', err);
        setVendorsLoading(false);
      });
  }, []);

  // Handle vendor selection - VendorSelector passes a Vendor object
  const handleSelectVendor = (vendor: Vendor | null) => {
    if (vendor) {
      addVendor(vendor.id);
      setIsAddingVendor(false);
      toast('success', 'Vendor added to comparison');
    }
  };

  // Handle save comparison
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveComparison();
      toast('success', 'Comparison saved successfully');
    } catch (error) {
      toast('error', 'Failed to save comparison');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'pdf' | 'json') => {
    setIsExporting(true);
    try {
      await exportComparison(format);
      toast('success', `Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast('error', 'Failed to export comparison');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shareUrl = await generateShareLink();
      toast('success', 'Share link copied to clipboard!');
    } catch (error) {
      toast('error', 'Failed to generate share link');
    } finally {
      setIsSharing(false);
    }
  };

  // Get currently selected vendors from the vendors array
  const selectedVendorObjects = vendors.filter(v => selectedVendors.includes(v.id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Comparison</h1>
              <p className="mt-1 text-sm text-gray-500">
                Compare up to {maxVendors} vendors side by side
              </p>
            </div>
            
            {vendorCount > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={refetch}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 text-gray-700 font-medium"
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  Refresh
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || vendorCount === 0}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 text-gray-700 font-medium"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </button>
                <button
                  onClick={handleShare}
                  disabled={isSharing || vendorCount === 0}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 text-gray-700 font-medium"
                >
                  {isSharing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                  Share
                </button>
                <button
                  onClick={clearComparison}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 text-red-800 border border-red-200 mb-6 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Vendor Selection */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Selected Vendors ({vendorCount}/{maxVendors})
              </h2>
              {canAddMore && (
                <button
                  onClick={() => setIsAddingVendor(true)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add Vendor
                </button>
              )}
            </div>
          </div>
          <div className="p-6">
            {vendorCount === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No vendors selected for comparison</p>
                <button
                  onClick={() => setIsAddingVendor(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Select Vendors to Compare
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {comparisonData?.map((item) => (
                  <div
                    key={item.vendor.id}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"
                  >
                    {item.vendor.logo_url && (
                      <img
                        src={item.vendor.logo_url}
                        alt={item.vendor.name}
                        className="h-6 w-6 rounded"
                      />
                    )}
                    <span className="font-medium text-gray-900">{item.vendor.name}</span>
                    <button
                      onClick={() => removeVendor(item.vendor.id)}
                      className="ml-1 p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                ))}
                {canAddMore && (
                  <button
                    onClick={() => setIsAddingVendor(true)}
                    className="px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      {/* Comparison Display */}
      {vendorCount > 0 && comparisonData && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Comparison Results</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('csv')}
                  disabled={isExporting}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 text-gray-700 text-sm font-medium"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 text-gray-700 text-sm font-medium"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </button>
                <button
                  onClick={() => handleExport('json')}
                  disabled={isExporting}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 text-gray-700 text-sm font-medium"
                >
                  <Download className="h-4 w-4" />
                  JSON
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
          <Tabs value={activeView} onValueChange={(v: any) => setActiveView(v)}>
            <TabsList className="mb-4">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-4 border-b border-gray-200 font-semibold text-gray-900">Vendor</th>
                        {comparisonData.map((item) => (
                          <th key={item.vendor.id} className="text-left p-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                              {item.vendor.logo_url && (
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                  <img
                                    src={item.vendor.logo_url}
                                    alt={item.vendor.name}
                                    className="w-6 h-6 object-contain"
                                  />
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-gray-900">{item.vendor.name}</div>
                                <div className="text-sm text-gray-500">
                                  {item.vendor.category}
                                </div>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 border-b border-gray-200 font-medium text-gray-900">Website</td>
                        {comparisonData.map((item) => (
                          <td key={item.vendor.id} className="p-4 border-b border-gray-200">
                            <a
                              href={item.vendor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {item.vendor.website}
                            </a>
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 border-b border-gray-200 font-medium text-gray-900">Plans</td>
                        {comparisonData.map((item) => (
                          <td key={item.vendor.id} className="p-4 border-b border-gray-200 text-gray-700">
                            {item.plans.length} plans available
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 border-b border-gray-200 font-medium text-gray-900">Starting Price</td>
                        {comparisonData.map((item) => {
                          const lowestPrice = item.prices
                            .filter(p => p.normalized_monthly_price)
                            .sort((a, b) => (a.normalized_monthly_price || 0) - (b.normalized_monthly_price || 0))[0];
                          
                          return (
                            <td key={item.vendor.id} className="p-4 border-b border-gray-200">
                              {lowestPrice ? (
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    ${lowestPrice.normalized_monthly_price?.toFixed(2)}/mo
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {lowestPrice.cadence === 'yearly' && 'Billed yearly'}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500">Contact sales</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="chart">
              <ComparisonChart 
                datasets={comparisonData.map(item => ({
                  vendorName: item.vendor.name,
                  vendorLogo: item.vendor.logo_url || undefined,
                  tiers: item.plans.map((plan) => {
                    const price = item.prices.find(p => p.plan_id === plan.id);
                    return {
                      name: plan.tier,
                      price: price?.normalized_monthly_price || 0,
                      confidence: price?.confidence_score || 0,
                      features: item.features
                        .filter(f => f.plan_id === plan.id)
                        .filter(f => f.included)
                        .map(f => f.feature)
                    };
                  }),
                  verified: true,
                  lastUpdated: new Date()
                }))}
                selectedTier="all"
                height={400}
                showFeatures={true}
                currency="USD"
                onVendorClick={(vendorName) => {
                  console.log(`Clicked on ${vendorName}`);
                }}
              />
            </TabsContent>

            <TabsContent value="features">
              <div className="text-center py-12 text-gray-500">
                Feature comparison matrix coming soon
              </div>
            </TabsContent>

            <TabsContent value="pricing">
              <div className="text-center py-12 text-gray-500">
                Detailed pricing breakdown coming soon
              </div>
            </TabsContent>
          </Tabs>
          </div>
        </div>
      )}
      </div>

      {/* Vendor Selection Modal */}
      {isAddingVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="border-b border-gray-200 px-6 py-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Select Vendor</h2>
              <button
                onClick={() => setIsAddingVendor(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex-1">
              {vendorsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Loading vendors...</span>
                </div>
              ) : (
                <>
                  <VendorSelector
                    vendors={vendors}
                    selectedVendor={null}
                    onSelect={handleSelectVendor}
                    excludeVendor={
                      selectedVendorObjects.length > 0 
                        ? selectedVendorObjects[selectedVendorObjects.length - 1] 
                        : null
                    }
                    placeholder="Search vendors..."
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
}