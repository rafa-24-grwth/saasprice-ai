// src/theme/colors.ts
// Theme configuration for SaaSPrice.AI

export const colors = {
    // Slate colors (gray scale)
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    
    // Cyan colors (for freshness indicators)
    cyan: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
    },
    
    // Green colors (success, positive values)
    green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    // Blue colors (primary actions)
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Purple colors (premium, special)
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    
    // Ink colors (text)
    ink: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    
    // SaaSPrice brand colors (matching your design system)
    sp: {
      accent: '#2563eb',        // Primary blue
      'accent-hover': '#1d4ed8',
      success: '#16a34a',
      warning: '#f59e0b',
      error: '#dc2626',
      'text-primary': '#0f172a',
      'text-secondary': '#64748b',
      'text-muted': '#94a3b8',
      'surface-0': '#ffffff',
      'surface-1': '#f8fafc',
      'surface-2': '#f1f5f9',
      border: '#e2e8f0',
    }
  };
  
  export const shadows = {
    // Card shadows
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    
    // Modal/dropdown shadows
    modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    
    // Button shadows
    button: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    buttonHover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    
    // Inner shadow
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    
    // None
    none: 'none',
  };
  
  // Utility function to get SaaSPrice brand colors
  export const getSpColor = (colorName: keyof typeof colors.sp): string => {
    return colors.sp[colorName];
  };
  
  // Utility function to get any color with shade
  export const getColor = (
    colorFamily: keyof Omit<typeof colors, 'sp'>,
    shade: number
  ): string => {
    const family = colors[colorFamily] as Record<number, string>;
    return family[shade] || family[500] || '#000000';
  };