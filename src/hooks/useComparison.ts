// hooks/useComparison.ts
// Custom hook for managing comparison state and logic

import { useState, useEffect, useCallback, useReducer } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type {
  ComparisonState,
  ComparisonAction,
  ComparisonData,
  ComparisonFilter,
  ComparisonSortOptions
} from '@/types/comparison';

const MAX_VENDORS = 5;

const initialState: ComparisonState = {
  selectedVendors: [],
  comparisonData: null,
  isLoading: false,
  error: null,
  filters: {},
  sortBy: {
    field: 'price',
    direction: 'asc'
  }
};

function comparisonReducer(state: ComparisonState, action: ComparisonAction): ComparisonState {
  switch (action.type) {
    case 'ADD_VENDOR':
      if (state.selectedVendors.includes(action.payload)) {
        return state;
      }
      if (state.selectedVendors.length >= MAX_VENDORS) {
        return {
          ...state,
          error: `Maximum ${MAX_VENDORS} vendors can be compared`
        };
      }
      return {
        ...state,
        selectedVendors: [...state.selectedVendors, action.payload],
        error: null
      };
    
    case 'REMOVE_VENDOR':
      return {
        ...state,
        selectedVendors: state.selectedVendors.filter(id => id !== action.payload),
        error: null
      };
    
    case 'SET_VENDORS':
      return {
        ...state,
        selectedVendors: action.payload.slice(0, MAX_VENDORS),
        error: action.payload.length > MAX_VENDORS 
          ? `Only first ${MAX_VENDORS} vendors will be compared` 
          : null
      };
    
    case 'SET_DATA':
      return {
        ...state,
        comparisonData: action.payload,
        error: null
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    
    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload
      };
    
    case 'CLEAR_COMPARISON':
      return initialState;
    
    default:
      return state;
  }
}

export function useComparison() {
  const [state, dispatch] = useReducer(comparisonReducer, initialState);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize from URL params
  useEffect(() => {
    const vendorIds = searchParams.get('vendors')?.split(',').filter(Boolean) || [];
    if (vendorIds.length > 0) {
      dispatch({ type: 'SET_VENDORS', payload: vendorIds });
    }
  }, [searchParams]);

  // Fetch comparison data
  const fetchComparisonData = useCallback(async () => {
    if (state.selectedVendors.length === 0) {
      dispatch({ type: 'SET_DATA', payload: [] });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const params = new URLSearchParams();
      params.set('vendor_ids', state.selectedVendors.join(','));
      
      // Add filters if present
      if (state.filters.tiers?.length) {
        params.set('tiers', state.filters.tiers.join(','));
      }
      if (state.filters.categories?.length) {
        params.set('categories', state.filters.categories.join(','));
      }

      const response = await fetch(`/api/compare?${params.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch comparison data');
      }

      const data = await response.json();
      dispatch({ type: 'SET_DATA', payload: data.comparisons });

    } catch (error) {
      console.error('Error fetching comparison:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to load comparison'
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.selectedVendors, state.filters]);

  // Update URL when vendors change
  useEffect(() => {
    if (state.selectedVendors.length > 0) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('vendors', state.selectedVendors.join(','));
      router.push(`/compare?${params.toString()}`, { scroll: false });
    }
  }, [state.selectedVendors, router, searchParams]);

  // Fetch data when vendors or filters change
  useEffect(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);

  // Add vendor to comparison
  const addVendor = useCallback((vendorId: string) => {
    dispatch({ type: 'ADD_VENDOR', payload: vendorId });
  }, []);

  // Remove vendor from comparison
  const removeVendor = useCallback((vendorId: string) => {
    dispatch({ type: 'REMOVE_VENDOR', payload: vendorId });
  }, []);

  // Set all vendors at once
  const setVendors = useCallback((vendorIds: string[]) => {
    dispatch({ type: 'SET_VENDORS', payload: vendorIds });
  }, []);

  // Clear comparison
  const clearComparison = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPARISON' });
    router.push('/compare');
  }, [router]);

  // Update filters
  const updateFilters = useCallback((filters: Partial<ComparisonFilter>) => {
    dispatch({ type: 'SET_FILTER', payload: filters });
  }, []);

  // Update sort
  const updateSort = useCallback((sort: ComparisonSortOptions) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  }, []);

  // Save comparison
  const saveComparison = useCallback(async (name?: string) => {
    if (state.selectedVendors.length === 0) {
      throw new Error('No vendors selected');
    }

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendor_ids: state.selectedVendors,
          name: name || `Comparison - ${new Date().toLocaleDateString()}`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save comparison');
      }

      const data = await response.json();
      return data.comparison;

    } catch (error) {
      console.error('Error saving comparison:', error);
      throw error;
    }
  }, [state.selectedVendors]);

  // Export comparison data
  const exportComparison = useCallback(async (format: 'csv' | 'pdf' | 'json') => {
    if (!state.comparisonData || state.comparisonData.length === 0) {
      throw new Error('No data to export');
    }

    try {
      const response = await fetch('/api/compare/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: state.comparisonData,
          format
        })
      });

      if (!response.ok) {
        throw new Error('Failed to export comparison');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comparison-${new Date().getTime()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting comparison:', error);
      throw error;
    }
  }, [state.comparisonData]);

  // Generate share link
  const generateShareLink = useCallback(async () => {
    if (state.selectedVendors.length === 0) {
      throw new Error('No vendors selected');
    }

    try {
      const response = await fetch('/api/compare/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendor_ids: state.selectedVendors
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate share link');
      }

      const data = await response.json();
      const shareUrl = `${window.location.origin}/compare/shared/${data.id}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      return shareUrl;

    } catch (error) {
      console.error('Error generating share link:', error);
      throw error;
    }
  }, [state.selectedVendors]);

  return {
    // State
    selectedVendors: state.selectedVendors,
    comparisonData: state.comparisonData,
    isLoading: state.isLoading,
    error: state.error,
    filters: state.filters,
    sortBy: state.sortBy,
    
    // Computed values
    canAddMore: state.selectedVendors.length < MAX_VENDORS,
    vendorCount: state.selectedVendors.length,
    maxVendors: MAX_VENDORS,
    
    // Actions
    addVendor,
    removeVendor,
    setVendors,
    clearComparison,
    updateFilters,
    updateSort,
    saveComparison,
    exportComparison,
    generateShareLink,
    refetch: fetchComparisonData
  };
}