'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Save,
  Star,
  AlertCircle,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

// Types
export interface SearchFilters {
  query: string;
  categories: string[];
  priceRange: {
    min: number | null;
    max: number | null;
  };
  features: string[];
  confidence: number;
  billingPeriod: 'monthly' | 'annual' | 'both';
  vendorSize: string[];
  integrations: string[];
  sortBy: 'relevance' | 'name' | 'price_low' | 'price_high' | 'newest' | 'confidence';
}

export interface FilterOptions {
  categories: Array<{ value: string; label: string; count: number }>;
  features: Array<{ value: string; label: string; count: number }>;
  vendorSizes: Array<{ value: string; label: string }>;
  integrations: Array<{ value: string; label: string; count: number }>;
  priceRange: { min: number; max: number };
}

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  filterOptions: FilterOptions;
  totalResults: number;
  onSaveSearch?: () => void;
  savedSearches?: Array<{ id: string; name: string; filters: SearchFilters }>;
  className?: string;
}

// Price Range Slider Component
function PriceRangeSlider({
  min,
  max,
  value,
  onChange
}: {
  min: number;
  max: number;
  value: [number | null, number | null];
  onChange: (value: [number | null, number | null]) => void;
}) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value) || null;
    setLocalValue([newMin, localValue[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value) || null;
    setLocalValue([localValue[0], newMax]);
  };

  const handleBlur = () => {
    onChange(localValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="number"
            value={localValue[0] || ''}
            onChange={handleMinChange}
            onBlur={handleBlur}
            placeholder={`$${min}`}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-gray-500">to</span>
        <div className="flex-1">
          <input
            type="number"
            value={localValue[1] || ''}
            onChange={handleMaxChange}
            onBlur={handleBlur}
            placeholder={`$${max}`}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={localValue[0] || min}
          onChange={(e) => {
            const newMin = parseInt(e.target.value);
            if (!localValue[1] || newMin <= localValue[1]) {
              setLocalValue([newMin, localValue[1]]);
            }
          }}
          onMouseUp={handleBlur}
          className="w-full"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={localValue[1] || max}
          onChange={(e) => {
            const newMax = parseInt(e.target.value);
            if (!localValue[0] || newMax >= localValue[0]) {
              setLocalValue([localValue[0], newMax]);
            }
          }}
          onMouseUp={handleBlur}
          className="w-full absolute top-0"
          style={{ background: 'transparent' }}
        />
      </div>
    </div>
  );
}

// Filter Section Component
function FilterSection({
  title,
  children,
  defaultOpen = true
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      
      {isOpen && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );
}

// Main Advanced Search Component
export default function AdvancedSearch({
  filters,
  onFiltersChange,
  filterOptions,
  totalResults,
  onSaveSearch,
  savedSearches = [],
  className
}: AdvancedSearchProps) {
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.query);
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Update filters when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== filters.query) {
      onFiltersChange({ ...filters, query: debouncedQuery });
    }
  }, [debouncedQuery]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.features.length > 0) count += filters.features.length;
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) count++;
    if (filters.confidence > 0) count++;
    if (filters.billingPeriod !== 'both') count++;
    if (filters.vendorSize.length > 0) count += filters.vendorSize.length;
    if (filters.integrations.length > 0) count += filters.integrations.length;
    return count;
  }, [filters]);

  const handleClearAll = () => {
    setSearchQuery('');
    onFiltersChange({
      query: '',
      categories: [],
      priceRange: { min: null, max: null },
      features: [],
      confidence: 0,
      billingPeriod: 'both',
      vendorSize: [],
      integrations: [],
      sortBy: 'relevance'
    });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    onFiltersChange({ ...filters, features: newFeatures });
  };

  const toggleIntegration = (integration: string) => {
    const newIntegrations = filters.integrations.includes(integration)
      ? filters.integrations.filter(i => i !== integration)
      : [...filters.integrations, integration];
    onFiltersChange({ ...filters, integrations: newIntegrations });
  };

  const toggleVendorSize = (size: string) => {
    const newSizes = filters.vendorSize.includes(size)
      ? filters.vendorSize.filter(s => s !== size)
      : [...filters.vendorSize, size];
    onFiltersChange({ ...filters, vendorSize: newSizes });
  };

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200", className)}>
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendors, features, or integrations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowAllFilters(!showAllFilters)}
            className={cn(
              "px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors",
              showAllFilters 
                ? "bg-blue-50 border-blue-500 text-blue-700" 
                : "border-gray-300 hover:bg-gray-50"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {activeFilterCount}
              </span>
            )}
          </button>

          {onSaveSearch && (
            <button
              onClick={onSaveSearch}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Save search"
            >
              <Save className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Active Filters Pills */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-gray-500">Active:</span>
            <div className="flex flex-wrap gap-2 flex-1">
              {filters.categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"
                >
                  {cat}
                  <X className="w-3 h-3" />
                </button>
              ))}
              
              {(filters.priceRange.min !== null || filters.priceRange.max !== null) && (
                <button
                  onClick={() => onFiltersChange({ ...filters, priceRange: { min: null, max: null } })}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"
                >
                  ${filters.priceRange.min || 0} - ${filters.priceRange.max || '∞'}
                  <X className="w-3 h-3" />
                </button>
              )}

              {filters.features.map(feature => (
                <button
                  key={feature}
                  onClick={() => toggleFeature(feature)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"
                >
                  {feature}
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
            
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filter Sections */}
      {showAllFilters && (
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Sort By */}
          <div className="pb-4 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Sort by
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="relevance">Relevance</option>
              <option value="name">Name (A-Z)</option>
              <option value="price_low">Price (Low to High)</option>
              <option value="price_high">Price (High to Low)</option>
              <option value="newest">Newest First</option>
              <option value="confidence">Confidence Score</option>
            </select>
          </div>

          {/* Categories */}
          <FilterSection title="Categories" defaultOpen={true}>
            <div className="space-y-2">
              {filterOptions.categories.map(cat => (
                <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat.value)}
                    onChange={() => toggleCategory(cat.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{cat.label}</span>
                  <span className="text-xs text-gray-400">({cat.count})</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Price Range (Monthly)" defaultOpen={true}>
            <PriceRangeSlider
              min={filterOptions.priceRange.min}
              max={filterOptions.priceRange.max}
              value={[filters.priceRange.min, filters.priceRange.max]}
              onChange={([min, max]) => onFiltersChange({ 
                ...filters, 
                priceRange: { min, max } 
              })}
            />
          </FilterSection>

          {/* Billing Period */}
          <FilterSection title="Billing Period" defaultOpen={false}>
            <div className="space-y-2">
              {['monthly', 'annual', 'both'].map(period => (
                <label key={period} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={filters.billingPeriod === period}
                    onChange={() => onFiltersChange({ ...filters, billingPeriod: period as any })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{period}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Features */}
          <FilterSection title="Features" defaultOpen={false}>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.features.map(feature => (
                <label key={feature.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.features.includes(feature.value)}
                    onChange={() => toggleFeature(feature.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{feature.label}</span>
                  <span className="text-xs text-gray-400">({feature.count})</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Integrations */}
          <FilterSection title="Integrations" defaultOpen={false}>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.integrations.map(integration => (
                <label key={integration.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.integrations.includes(integration.value)}
                    onChange={() => toggleIntegration(integration.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{integration.label}</span>
                  <span className="text-xs text-gray-400">({integration.count})</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Vendor Size */}
          <FilterSection title="Company Size" defaultOpen={false}>
            <div className="space-y-2">
              {filterOptions.vendorSizes.map(size => (
                <label key={size.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.vendorSize.includes(size.value)}
                    onChange={() => toggleVendorSize(size.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{size.label}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Confidence Score */}
          <FilterSection title="Minimum Confidence" defaultOpen={false}>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.confidence}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  confidence: parseInt(e.target.value) 
                })}
                className="flex-1"
              />
              <span className="text-sm text-gray-700 w-12 text-right">
                {filters.confidence}%
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Any</span>
              <span>High confidence only</span>
            </div>
          </FilterSection>

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <FilterSection title="Saved Searches" defaultOpen={false}>
              <div className="space-y-2">
                {savedSearches.map(search => (
                  <button
                    key={search.id}
                    onClick={() => onFiltersChange(search.filters)}
                    className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <Star className="w-4 h-4 text-gray-400" />
                    {search.name}
                  </button>
                ))}
              </div>
            </FilterSection>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        Found <span className="font-medium text-gray-900">{totalResults}</span> vendors
        {activeFilterCount > 0 && (
          <span> matching your filters</span>
        )}
      </div>
    </div>
  );
}