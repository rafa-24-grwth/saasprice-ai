// app/(protected)/vendors/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search,
  Filter,
  Grid3x3, 
  List, 
  Eye, 
  Plus,
  AlertCircle,
  X,
  Building2,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Vendor {
  id: string;
  name: string;
  logo_url?: string;
  category?: string;
  starting_price?: number;
  currency?: string;
  confidence_score?: number;
  last_updated?: string;
}

function VendorCard({ vendor, onAddToWatchlist, onCompare, isInWatchlist }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
          {vendor.logo_url ? (
            <img src={vendor.logo_url} alt={vendor.name} className="w-8 h-8 object-contain" />
          ) : (
            <Building2 className="w-6 h-6 text-gray-500" />
          )}
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddToWatchlist?.(vendor)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isInWatchlist ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
            )}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onCompare?.(vendor)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Link href={`/vendors/${vendor.id}`}>
        <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
          {vendor.name}
        </h3>
      </Link>

      <p className="text-sm text-gray-500 mb-4">{vendor.category || 'Uncategorized'}</p>

      <div className="flex items-center justify-between">
        <div>
          {vendor.starting_price ? (
            <>
              <span className="text-2xl font-bold text-gray-900">${vendor.starting_price}</span>
              <span className="text-sm text-gray-500">/mo</span>
            </>
          ) : (
            <span className="text-sm text-gray-500">Contact sales</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <div className={cn(
            "w-2 h-2 rounded-full",
            vendor.confidence_score >= 80 ? "bg-green-500" :
            vendor.confidence_score >= 60 ? "bg-yellow-500" : "bg-red-500"
          )} />
          <span className="text-xs text-gray-500">{vendor.confidence_score || 0}%</span>
        </div>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [compareList, setCompareList] = useState<Set<string>>(new Set());

  const categories = [
    'All Categories',
    'Communication',
    'Project Management',
    'Analytics',
    'Marketing',
    'Sales',
    'Developer Tools',
    'Design',
    'HR & Recruiting',
    'Customer Support'
  ];

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/vendors');
      const data = await response.json();
      setVendors(data.vendors || []);
      setFilteredVendors(data.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
      setFilteredVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterVendors(query, selectedCategory, priceRange, sortBy);
  };

  const filterVendors = (query: string, category: string, range: any, sort: string) => {
    let filtered = [...vendors];

    if (query) {
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(query.toLowerCase()) ||
        v.category?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter(v => v.category === category);
    }

    filtered = filtered.filter(v => {
      if (!v.starting_price) return true;
      return v.starting_price >= range.min && v.starting_price <= range.max;
    });

    filtered.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_low':
          return (a.starting_price ?? Infinity) - (b.starting_price ?? Infinity);
        case 'price_high':
          return (b.starting_price ?? -Infinity) - (a.starting_price ?? -Infinity);
        default:
          return 0;
      }
    });

    setFilteredVendors(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Directory</h1>
              <p className="mt-1 text-sm text-gray-500">
                Browse and compare {vendors.length} SaaS vendors
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg",
                  viewMode === 'grid' ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg",
                  viewMode === 'list' ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-700 font-medium min-w-[120px]"
          >
            <Filter className="w-5 h-5 text-gray-600" />
            <span>Filters</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform text-gray-600", showFilters && "rotate-180")} />
          </button>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              filterVendors(searchQuery, selectedCategory, priceRange, e.target.value);
            }}
            className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 font-medium cursor-pointer"
          >
            <option value="relevance">Relevance</option>
            <option value="name">Name A-Z</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    filterVendors(searchQuery, e.target.value, priceRange, sortBy);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (Monthly)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => {
                      const newRange = { ...priceRange, min: Number(e.target.value) };
                      setPriceRange(newRange);
                      filterVendors(searchQuery, selectedCategory, newRange, sortBy);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => {
                      const newRange = { ...priceRange, max: Number(e.target.value) };
                      setPriceRange(newRange);
                      filterVendors(searchQuery, selectedCategory, newRange, sortBy);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange({ min: 0, max: 1000 });
                    setSortBy('relevance');
                    setFilteredVendors(vendors);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Found {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''}
        </div>

        {/* Vendors Grid/List */}
        {filteredVendors.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {filteredVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onAddToWatchlist={(v: Vendor) => {
                  setWatchlist(prev => {
                    const newSet = new Set(prev);
                    newSet.has(v.id) ? newSet.delete(v.id) : newSet.add(v.id);
                    return newSet;
                  });
                }}
                onCompare={(v: Vendor) => {
                  setCompareList(prev => {
                    const newSet = new Set(prev);
                    newSet.has(v.id) ? newSet.delete(v.id) : newSet.add(v.id);
                    return newSet;
                  });
                }}
                isInWatchlist={watchlist.has(vendor.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Compare Bar */}
      {compareList.size > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white rounded-lg shadow-xl px-6 py-3 z-30">
          <div className="flex items-center gap-4">
            <span>{compareList.size} selected</span>
            <Link
              href={`/compare?vendors=${Array.from(compareList).join(',')}`}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
            >
              Compare
            </Link>
            <button onClick={() => setCompareList(new Set())}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}