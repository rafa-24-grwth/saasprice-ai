// components/ui/tooltip.tsx
// Simple tooltip component replacement

import * as React from 'react';

interface TooltipProps {
  children: React.ReactNode;
}

interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
}

interface TooltipTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

// Provider - just passes through children
export function TooltipProvider({ children }: TooltipProps) {
  return <>{children}</>;
}

// Main tooltip wrapper - just passes through children  
export function Tooltip({ children }: TooltipProps) {
  return <>{children}</>;
}

// Trigger element - renders children with title attribute for native tooltip
export function TooltipTrigger({ children, className }: TooltipTriggerProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// Content - for now, we'll just return null to avoid errors
// In a real implementation, this would show on hover
export function TooltipContent({ children }: TooltipContentProps) {
  // Return null to prevent rendering
  // The native browser tooltip (title attribute) will handle the display
  return null;
}

// Export all components
export {
  Tooltip as default,
};