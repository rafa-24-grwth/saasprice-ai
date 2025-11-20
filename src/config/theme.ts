// src/config/theme.ts

/**
 * SaaSPrice.AI Theme Configuration
 * Institutional-grade design system for RevOps/FP&A professionals
 * 
 * Core principles:
 * - Precise, confident, verifiable (numbers > adjectives)
 * - Clean cards, lots of air, thin-line icons, subtle shadows
 * - No gradients in UI (gradients only in hero art)
 */

// Color palette
export const colors = {
    // Brand Colors
    brand: {
      primary: '#2D5BFF',    // Primary Blue 600 - CTAs, links
      primaryHover: '#2449CC', // Blue 700 - Hover state
      primaryLight: '#9DB2FF', // Blue 200 - Focus rings
    },
  
    // Semantic Colors
    semantic: {
      verified: '#7C3AED',    // Purple 600 - Verified states, badges
      verifiedBg: '#F4EFFE',  // Purple 50 - Verified backgrounds
      success: '#10B981',     // Green 600 - Savings, positive deltas
      successBg: '#ECFDF5',   // Green 50 - Success backgrounds
      warning: '#F59E0B',     // Amber 500 - Warnings
      error: '#EF4444',       // Red 600 - Errors
      info: '#06B6D4',        // Cyan 500 - Information
      infoBg: '#E0F2FE',      // Cyan 50 - Info backgrounds
    },
  
    // Neutral Stack
    neutral: {
      ink900: '#0B1220',      // Headlines, primary text
      slate800: '#1F2937',    // Secondary headlines
      slate600: '#475569',    // Body text
      mist200: '#E5EAF2',     // Dividers, borders
      snow50: '#F7F9FC',      // Page backgrounds
      white: '#FFFFFF',       // Cards, pure white
    },
  
    // Data Visualization (ordered by priority)
    dataViz: [
      '#2D5BFF',  // Primary Blue
      '#7C3AED',  // Purple
      '#10B981',  // Green
      '#06B6D4',  // Cyan
      '#F59E0B',  // Amber
      '#EF4444',  // Red
    ],
  } as const;
  
  // Shadow system
  export const shadows = {
    card: '0 6px 24px rgba(2, 6, 23, 0.06)',
    cardHover: '0 12px 32px rgba(2, 6, 23, 0.08)',
    dropdown: '0 4px 16px rgba(2, 6, 23, 0.08)',
    modal: '0 20px 40px rgba(2, 6, 23, 0.12)',
    button: '0 2px 8px rgba(2, 6, 23, 0.04)',
    buttonHover: '0 4px 12px rgba(2, 6, 23, 0.08)',
  } as const;
  
  // Border radius
  export const radius = {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '9999px',
  } as const;
  
  // Typography
  export const typography = {
    // Font families
    fontFamily: {
      display: '"Inter Display", "Neue Haas Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace',
    },
  
    // Font sizes
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '2rem',    // 32px
      '4xl': '2.75rem', // 44px
      '5xl': '3.5rem',  // 56px
    },
  
    // Font weights
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  
    // Line heights
    lineHeight: {
      tight: 1.05,
      snug: 1.1,
      normal: 1.15,
      relaxed: 1.6,
      loose: 1.7,
    },
  
    // Letter spacing
    letterSpacing: {
      tighter: '-0.02em',
      tight: '-0.01em',
      normal: '0',
      wide: '0.01em',
    },
  } as const;
  
  // Spacing scale
  export const spacing = {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    7: '1.75rem',   // 28px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  } as const;
  
  // Animation/Transition
  export const animation = {
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '200ms',
      slow: '250ms',
      slower: '350ms',
    },
    easing: {
      easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  } as const;
  
  // Breakpoints
  export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  } as const;
  
  // Z-index scale
  export const zIndex = {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  } as const;
  
  // Component-specific tokens
  export const components = {
    button: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px',
      },
      padding: {
        sm: '8px 12px',
        md: '10px 20px',
        lg: '12px 24px',
      },
    },
    card: {
      padding: '24px',
      paddingLg: '28px',
    },
    input: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px',
      },
    },
  } as const;
  
  // Utility function to get CSS variables for runtime use
  export const getCSSVariables = () => {
    return `
      :root {
        /* Brand Colors */
        --color-primary: ${colors.brand.primary};
        --color-primary-hover: ${colors.brand.primaryHover};
        --color-primary-light: ${colors.brand.primaryLight};
        
        /* Semantic Colors */
        --color-verified: ${colors.semantic.verified};
        --color-verified-bg: ${colors.semantic.verifiedBg};
        --color-success: ${colors.semantic.success};
        --color-success-bg: ${colors.semantic.successBg};
        --color-warning: ${colors.semantic.warning};
        --color-error: ${colors.semantic.error};
        --color-info: ${colors.semantic.info};
        --color-info-bg: ${colors.semantic.infoBg};
        
        /* Neutral Colors */
        --color-ink-900: ${colors.neutral.ink900};
        --color-slate-800: ${colors.neutral.slate800};
        --color-slate-600: ${colors.neutral.slate600};
        --color-mist-200: ${colors.neutral.mist200};
        --color-snow-50: ${colors.neutral.snow50};
        --color-white: ${colors.neutral.white};
        
        /* Shadows */
        --shadow-card: ${shadows.card};
        --shadow-card-hover: ${shadows.cardHover};
        --shadow-dropdown: ${shadows.dropdown};
        --shadow-modal: ${shadows.modal};
        
        /* Typography */
        --font-display: ${typography.fontFamily.display};
        --font-body: ${typography.fontFamily.body};
        --font-mono: ${typography.fontFamily.mono};
      }
    `;
  };
  
  // Tailwind config extension
  export const tailwindExtend = {
    colors: {
      primary: colors.brand.primary,
      'primary-hover': colors.brand.primaryHover,
      'primary-light': colors.brand.primaryLight,
      verified: colors.semantic.verified,
      'verified-bg': colors.semantic.verifiedBg,
      success: colors.semantic.success,
      'success-bg': colors.semantic.successBg,
      warning: colors.semantic.warning,
      error: colors.semantic.error,
      info: colors.semantic.info,
      'info-bg': colors.semantic.infoBg,
      ink: {
        900: colors.neutral.ink900,
      },
      slate: {
        800: colors.neutral.slate800,
        600: colors.neutral.slate600,
      },
      mist: {
        200: colors.neutral.mist200,
      },
      snow: {
        50: colors.neutral.snow50,
      },
    },
    boxShadow: shadows,
    borderRadius: radius,
    fontFamily: {
      display: [typography.fontFamily.display],
      body: [typography.fontFamily.body],
      mono: [typography.fontFamily.mono],
    },
  };
  
  // Type exports for TypeScript
  export type Colors = typeof colors;
  export type Shadows = typeof shadows;
  export type Radius = typeof radius;
  export type Typography = typeof typography;
  export type Spacing = typeof spacing;
  export type Animation = typeof animation;
  export type Breakpoints = typeof breakpoints;
  export type ZIndex = typeof zIndex;
  
  // Default export
  const theme = {
    colors,
    shadows,
    radius,
    typography,
    spacing,
    animation,
    breakpoints,
    zIndex,
    components,
    getCSSVariables,
    tailwindExtend,
  } as const;
  
  export default theme;