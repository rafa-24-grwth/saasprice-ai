'use client';

import { useId, useState } from 'react';
import { Info, Calculator, Shield, Clock, TrendingUp } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import Link from 'next/link';

interface MethodologyPopoverProps {
  variant?: 'icon' | 'text' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const MethodologyPopover: React.FC<MethodologyPopoverProps> = ({
  variant = 'text',
  size = 'md',
  className = '',
  children
}) => {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const renderTrigger = () => {
    switch (variant) {
      case 'icon':
        return (
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label="View pricing methodology"
              aria-controls={contentId}
              aria-expanded={open}
              className={`
                inline-flex items-center justify-center
                text-sp-text-muted hover:text-sp-text-secondary 
                transition-colors rounded-full
                focus:outline-none focus:ring-2 focus:ring-sp-focus 
                focus:ring-offset-2 focus:ring-offset-sp-surface-0
                ${className}
              `}
            >
              <Info className={iconSizeClasses[size]} aria-hidden="true" />
            </button>
          </Popover.Trigger>
        );
      
      case 'button':
        return (
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label="View pricing methodology"
              aria-controls={contentId}
              aria-expanded={open}
              className={`
                inline-flex items-center gap-1.5
                px-3 py-1.5 rounded-md
                bg-sp-surface-1 hover:bg-sp-surface-2
                text-sp-text-secondary
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-sp-focus 
                focus:ring-offset-2 focus:ring-offset-sp-surface-0
                ${sizeClasses[size]} ${className}
              `}
            >
              <Info className={iconSizeClasses[size]} aria-hidden="true" />
              <span>How we calculate</span>
            </button>
          </Popover.Trigger>
        );
      
      default: // text
        return (
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label="View pricing methodology"
              aria-controls={contentId}
              aria-expanded={open}
              className={`
                inline-flex items-center gap-1 
                text-sp-text-muted hover:text-sp-text-secondary
                transition-colors underline underline-offset-2
                focus:outline-none focus:ring-2 focus:ring-sp-focus 
                focus:ring-offset-2 focus:ring-offset-sp-surface-0
                ${sizeClasses[size]} ${className}
              `}
            >
              <Info className={iconSizeClasses[size]} aria-hidden="true" />
              <span>Methodology</span>
            </button>
          </Popover.Trigger>
        );
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      {children || renderTrigger()}
      
      <Popover.Portal>
        <Popover.Content
          id={contentId}
          className="
            w-80 p-4 rounded-lg shadow-lg
            bg-sp-surface-0 border border-sp-border
            text-sm z-50
            data-[state=open]:animate-in
            data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0
            data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95
            data-[state=open]:zoom-in-95
            data-[side=bottom]:slide-in-from-top-2
            data-[side=left]:slide-in-from-right-2
            data-[side=right]:slide-in-from-left-2
            data-[side=top]:slide-in-from-bottom-2
          "
          sideOffset={5}
          align="center"
        >
          {/* Header */}
          <div className="mb-3">
            <h4 className="font-semibold text-sp-text-primary flex items-center gap-2">
              <Calculator className="h-4 w-4 text-sp-accent" />
              How we normalize pricing
            </h4>
          </div>

          {/* Main content */}
          <div className="space-y-3 text-sp-text-secondary">
            {/* Normalization rules */}
            <div>
              <h5 className="font-medium text-sp-text-primary mb-1 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Normalization Rules
              </h5>
              <ul className="space-y-1 text-xs">
                <li className="flex items-start gap-1">
                  <span className="text-sp-text-muted mt-0.5">•</span>
                  <span>Annual prices shown as monthly equivalent</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-sp-text-muted mt-0.5">•</span>
                  <span>All prices normalized to 10 seats for comparison</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-sp-text-muted mt-0.5">•</span>
                  <span>Overage calculated at typical usage (configurable)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-sp-text-muted mt-0.5">•</span>
                  <span>All prices exclude taxes unless noted</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-sp-text-muted mt-0.5">•</span>
                  <span>Enterprise discounts not included</span>
                </li>
              </ul>
            </div>

            {/* Data sources */}
            <div>
              <h5 className="font-medium text-sp-text-primary mb-1 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Data Sources
              </h5>
              <ul className="space-y-1 text-xs">
                <li className="flex items-start gap-1">
                  <span className="text-sp-text-muted mt-0.5">•</span>
                  <span>Public pricing pages (monitored nightly)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-sp-text-muted mt-0.5">•</span>
                  <span>Vendor-submitted pricing (verified)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-sp-text-muted mt-0.5">•</span>
                  <span>API integrations where available</span>
                </li>
              </ul>
            </div>

            {/* Update frequency */}
            <div>
              <h5 className="font-medium text-sp-text-primary mb-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Update Frequency
              </h5>
              <p className="text-xs">
                Pricing data is refreshed every 24 hours. 
                API-verified vendors update in real-time.
              </p>
            </div>
          </div>

          {/* Footer link */}
          <div className="mt-4 pt-3 border-t border-sp-border">
            <Link 
              href="/methodology" 
              className="
                text-xs font-medium text-sp-accent hover:text-sp-accent-hover 
                inline-flex items-center gap-1
              "
            >
              View full methodology
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Arrow */}
          <Popover.Arrow className="fill-sp-surface-0" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};