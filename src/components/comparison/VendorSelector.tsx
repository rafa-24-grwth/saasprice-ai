// components/compare/VendorSelector.tsx
// Fixed version with proper type imports and flexible props

'use client';

import { useState, useId, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import type { Vendor } from '@/types/database';

// More flexible props interface to handle different use cases
interface VendorSelectorProps {
  // Option 1: Pass vendors array (original interface)
  vendors?: Vendor[];
  selectedVendor?: Vendor | null;
  
  // Option 2: Handle selection by ID (for comparison page)
  selectedVendorId?: string;
  onSelect: (vendor: Vendor | null) => void;
  
  // Exclusion can be single vendor or array of IDs
  excludeVendor?: Vendor | null;
  excludedVendorIds?: string[];
  
  placeholder?: string;
  
  // Allow fetching vendors if not provided
  fetchVendors?: () => Promise<Vendor[]>;
}

export default function VendorSelector({
  vendors: providedVendors,
  selectedVendor: providedSelectedVendor,
  selectedVendorId,
  onSelect,
  excludeVendor,
  excludedVendorIds = [],
  placeholder = 'Select a vendor...',
  fetchVendors
}: VendorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [vendors, setVendors] = useState<Vendor[]>(providedVendors || []);
  const [loading, setLoading] = useState(false);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Use useId for SSR-safe unique IDs
  const comboboxId = useId();
  const listboxId = `${comboboxId}-listbox`;

  // Determine selected vendor from props
  const selectedVendor = providedSelectedVendor || 
    (selectedVendorId ? vendors.find(v => v.id === selectedVendorId) : null) || 
    null;

  // Fetch vendors if not provided and fetchVendors is available
  useEffect(() => {
    if (!providedVendors && fetchVendors) {
      setLoading(true);
      fetchVendors()
        .then(setVendors)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [providedVendors, fetchVendors]);

  // Update local vendors when provided vendors change
  useEffect(() => {
    if (providedVendors) {
      setVendors(providedVendors);
    }
  }, [providedVendors]);

  // Build exclusion list from both props
  const exclusionIds = new Set<string>();
  if (excludeVendor) {
    exclusionIds.add(excludeVendor.id);
  }
  excludedVendorIds.forEach(id => exclusionIds.add(id));

  // Filter vendors based on search and exclusion
  const filteredVendors = vendors.filter(vendor => {
    if (exclusionIds.has(vendor.id)) return false;
    if (!search) return true;
    return vendor.name.toLowerCase().includes(search.toLowerCase()) ||
           (vendor.category && vendor.category.toLowerCase().includes(search.toLowerCase()));
  });

  // Get the ID of the currently focused option for aria-activedescendant
  const focusedOptionId = focusedIndex >= 0 && focusedIndex < filteredVendors.length 
    ? `${comboboxId}-option-${focusedIndex}` 
    : undefined;

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const optionElement = listboxRef.current.querySelector(`#${comboboxId}-option-${focusedIndex}`);
      if (optionElement) {
        optionElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [isOpen, focusedIndex, comboboxId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`[data-vendor-selector="${comboboxId}"]`)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, comboboxId]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            prev < filteredVendors.length - 1 ? prev + 1 : prev
          );
        }
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => prev > 0 ? prev - 1 : 0);
        }
        break;
      
      case 'Enter':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0 && focusedIndex < filteredVendors.length) {
          handleSelect(filteredVendors[focusedIndex]);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearch('');
        setFocusedIndex(-1);
        break;
      
      case 'Tab':
        // Allow normal tab behavior but close dropdown
        setIsOpen(false);
        break;
    }
  };

  // Handle selection
  const handleSelect = (vendor: Vendor) => {
    onSelect(vendor);
    setIsOpen(false);
    setSearch('');
    setFocusedIndex(-1);
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-3 bg-white text-gray-500 border border-gray-300 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
        Loading vendors...
      </div>
    );
  }

  return (
    <div className="relative" data-vendor-selector={comboboxId}>
      {/* Search input - always visible */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            setFocusedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-white text-gray-900 
                   border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   focus:border-blue-500
                   placeholder-gray-400 transition-all"
          aria-label="Search vendors"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-owns={listboxId}
          aria-controls={listboxId}
          aria-activedescendant={isOpen ? focusedOptionId : undefined}
        />
        <ChevronsUpDown 
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
          aria-hidden="true"
        />
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 
                   rounded-lg shadow-xl overflow-hidden"
        >
          {/* Options list */}
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-label="Select a vendor"
            className="max-h-96 overflow-auto"
          >
            {filteredVendors.length === 0 ? (
              <li className="px-4 py-8 text-gray-500 text-sm text-center">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="font-medium text-gray-900">No vendors found</p>
                  <p className="text-xs">Try a different search term</p>
                </div>
              </li>
            ) : (
              filteredVendors.map((vendor, index) => (
                <li
                  key={vendor.id}
                  id={`${comboboxId}-option-${index}`}
                  role="option"
                  aria-selected={selectedVendor?.id === vendor.id}
                  onClick={() => handleSelect(vendor)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`
                    px-4 py-3 flex items-center gap-3 cursor-pointer
                    transition-all border-b border-gray-100 last:border-b-0
                    ${index === focusedIndex ? 'bg-blue-50' : ''}
                    ${selectedVendor?.id === vendor.id ? 'bg-blue-50' : ''}
                    hover:bg-blue-50
                  `}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    {vendor.logo_url ? (
                      <img 
                        src={vendor.logo_url} 
                        alt=""
                        className="w-6 h-6 object-contain"
                        aria-hidden="true"
                      />
                    ) : (
                      <span className="text-gray-400 font-semibold text-sm">
                        {vendor.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {vendor.name}
                    </div>
                    {vendor.category && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {vendor.category}
                      </div>
                    )}
                  </div>
                  {selectedVendor?.id === vendor.id && (
                    <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" aria-hidden="true" />
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// Export the VendorSelector for backward compatibility
export { default as VendorSelector } from './VendorSelector';