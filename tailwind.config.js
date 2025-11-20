/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Keep your existing CSS variables for backward compatibility
        'sp-surface-0': 'var(--sp-surface-0)',
        'sp-surface-1': 'var(--sp-surface-1)',
        'sp-surface-2': 'var(--sp-surface-2)',
        'sp-text-primary': 'var(--sp-text-primary)',
        'sp-text-secondary': 'var(--sp-text-secondary)',
        'sp-text-muted': 'var(--sp-text-muted)',
        'sp-border': 'var(--sp-border)',
        'sp-accent': 'var(--sp-accent)',
        'sp-accent-hover': 'var(--sp-accent-hover)',
        'sp-success': 'var(--sp-success)',
        'sp-warning': 'var(--sp-warning)',
        'sp-error': 'var(--sp-error)',
        'sp-focus': 'var(--sp-focus)',
        
        // New institutional-grade theme colors
        primary: {
          DEFAULT: '#2D5BFF',
          hover: '#2449CC',
          light: '#9DB2FF',
        },
        verified: {
          DEFAULT: '#7C3AED',
          bg: '#F4EFFE',
        },
        success: {
          DEFAULT: '#10B981',
          bg: '#ECFDF5',
        },
        warning: {
          DEFAULT: '#F59E0B',
        },
        error: {
          DEFAULT: '#EF4444',
        },
        info: {
          DEFAULT: '#06B6D4',
          bg: '#E0F2FE',
        },
        // Neutral color stack
        ink: {
          900: '#0B1220',
        },
        slate: {
          800: '#1F2937',
          600: '#475569',
        },
        mist: {
          200: '#E5EAF2',
        },
        snow: {
          50: '#F7F9FC',
        },
      },
      boxShadow: {
        'card': '0 6px 24px rgba(2, 6, 23, 0.06)',
        'card-hover': '0 12px 32px rgba(2, 6, 23, 0.08)',
        'dropdown': '0 4px 16px rgba(2, 6, 23, 0.08)',
        'modal': '0 20px 40px rgba(2, 6, 23, 0.12)',
        'button': '0 2px 8px rgba(2, 6, 23, 0.04)',
        'button-hover': '0 4px 12px rgba(2, 6, 23, 0.08)',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      fontFamily: {
        'display': ['"Inter Display"', '"Neue Haas Grotesk"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        'body': ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        'mono': ['"SF Mono"', '"Monaco"', '"Inconsolata"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',  // 10px
        'xs': '0.75rem',    // 12px
        'sm': '0.875rem',   // 14px
        'base': '1rem',     // 16px
        'lg': '1.125rem',   // 18px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '2rem',      // 32px
        '4xl': '2.75rem',   // 44px
        '5xl': '3.5rem',    // 56px
      },
      letterSpacing: {
        'tighter': '-0.02em',
        'tight': '-0.01em',
        'normal': '0',
        'wide': '0.01em',
      },
      lineHeight: {
        'tight': '1.05',
        'snug': '1.1',
        'normal': '1.15',
        'relaxed': '1.6',
        'loose': '1.7',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'fade-out': 'fadeOut 150ms ease-in',
        'slide-up': 'slideUp 250ms ease-out',
        'slide-down': 'slideDown 250ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionDuration: {
        '0': '0ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '350': '350ms',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '120': '30rem',
      },
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },
    },
  },
  plugins: [],
}