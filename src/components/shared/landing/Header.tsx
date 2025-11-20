'use client';

// components/landing/Header.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
// Import the entire theme or just use the colors directly
import theme from '@/config/theme';
import { Button } from '@/components/shared/ui/button';

interface NavLink {
  href: string;
  label: string;
  analytics: string;
}

const navLinks: NavLink[] = [
  { href: '#features', label: 'Features', analytics: 'nav_features' },
  { href: '#how-it-works', label: 'How it works', analytics: 'nav_how' },
  { href: '#pricing', label: 'Pricing', analytics: 'nav_pricing' },
  { href: '#roi-calculator', label: 'Free Tool', analytics: 'nav_tool' },
];

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    
    // Add escape key handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

  // Smooth scroll function
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offset = 80; // Account for sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };
  
  return (
    <>
      {/* Skip link for accessibility */}
      <a 
        href="#main" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white border px-3 py-2 rounded"
      >
        Skip to content
      </a>
      
      <header 
        className="sticky top-0 z-50 backdrop-blur-sm border-b"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: theme.colors.neutral.mist200 
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <a 
                href="/" 
                className="text-xl font-bold"
                style={{ color: theme.colors.neutral.ink900 }}
                data-analytics="nav_logo"
              >
                SaaSPrice.AI
              </a>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-sm font-medium transition hover:opacity-80"
                  style={{ color: theme.colors.neutral.slate600 }}
                  data-analytics={link.analytics}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            
            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border"
                  style={{ 
                    borderColor: theme.colors.neutral.mist200,
                    color: theme.colors.neutral.slate600
                  }}
                  data-analytics="header_login"
                >
                  Log in
                </Button>
              </Link>
              <a
                href="#roi-calculator"
                onClick={(e) => scrollToSection(e, '#roi-calculator')}
                className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition hover:opacity-90"
                style={{ backgroundColor: theme.colors.brand.primary }}
                data-analytics="header_cta_analyzer"
              >
                Try Free Analyzer →
              </a>
            </div>
            
            {/* Mobile menu button */}
            <button 
              type="button"
              className="md:hidden"
              style={{ color: theme.colors.neutral.slate600 }}
              onClick={() => setMobileMenuOpen(prev => !prev)}
              onKeyDown={(e) => e.key === 'Escape' && setMobileMenuOpen(false)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <nav 
              id="mobile-nav" 
              className="md:hidden py-4 border-t"
              style={{ borderColor: theme.colors.neutral.mist200 }}
              aria-label="Mobile"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium"
                    style={{ color: theme.colors.neutral.slate600 }}
                    onClick={(e) => scrollToSection(e, link.href)}
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm font-medium rounded-lg text-center border"
                  style={{ 
                    borderColor: theme.colors.neutral.mist200,
                    color: theme.colors.neutral.slate600
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                  data-analytics="mobile_login"
                >
                  Log in
                </Link>
                <a
                  href="#roi-calculator"
                  onClick={(e) => scrollToSection(e, '#roi-calculator')}
                  className="px-5 py-2.5 text-sm font-medium text-white rounded-lg text-center"
                  style={{ backgroundColor: theme.colors.brand.primary }}
                  data-analytics="mobile_cta_analyzer"
                >
                  Try Free Analyzer →
                </a>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;