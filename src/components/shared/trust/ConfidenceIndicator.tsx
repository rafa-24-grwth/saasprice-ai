'use client';

import { useId } from 'react';
import { CheckCircle2, AlertCircle, XCircle, HelpCircle } from 'lucide-react';

interface ConfidenceIndicatorProps {
  value: number; // 0-1 ratio (1 = 100% confidence)
  level?: 'high' | 'medium' | 'low' | 'auto';
  showPercentage?: boolean;
  showHelp?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isUpdating?: boolean;
  onHelpClick?: () => void;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  value,
  level = 'auto',
  showPercentage = true,
  showHelp = true,
  size = 'md',
  isUpdating = false,
  onHelpClick
}) => {
  const indicatorId = useId();
  const tooltipId = `confidence-tooltip-${indicatorId}`;

  // Convert ratio to percentage for display
  const percentage = Math.round(value * 100);

  // Auto-determine level based on ratio
  const determinedLevel = level === 'auto' 
    ? value >= 0.8 ? 'high' 
    : value >= 0.5 ? 'medium' 
    : 'low'
    : level;

  const configs = {
    high: { 
      color: 'text-green-600 dark:text-green-400', 
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      icon: CheckCircle2, 
      label: 'High confidence',
      description: 'Based on verified data from multiple sources'
    },
    medium: { 
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20', 
      icon: AlertCircle, 
      label: 'Medium confidence',
      description: 'Based on monitored public pricing'
    },
    low: { 
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20', 
      icon: XCircle, 
      label: 'Low confidence',
      description: 'Based on limited or older data'
    }
  };

  const config = configs[determinedLevel];
  const Icon = config.icon;

  // Size classes
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2'
  };

  const iconSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const containerPadding = {
    sm: 'px-1.5 py-0.5',
    md: 'px-2 py-1',
    lg: 'px-3 py-1.5'
  };

  return (
    <div 
      className={`inline-flex items-center ${sizeClasses[size]} ${containerPadding[size]} rounded-md ${config.bgColor}`}
      aria-live={isUpdating ? 'polite' : undefined} 
      aria-atomic={isUpdating ? 'true' : undefined}
    >
      <Icon 
        className={`${iconSizeClasses[size]} ${config.color}`} 
        aria-hidden="true" 
      />
      
      {showPercentage && (
        <span 
          className={`font-semibold ${config.color}`}
          aria-label={config.label} 
          aria-describedby={tooltipId}
        >
          {percentage}%
        </span>
      )}
      
      {!showPercentage && (
        <span 
          className={`font-medium ${config.color}`}
          aria-describedby={tooltipId}
        >
          {config.label}
        </span>
      )}
      
      {showHelp && (
        <button
          onClick={onHelpClick || (() => {})}
          className={`${config.color} hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded`}
          aria-label="Learn how confidence is calculated"
          type="button"
        >
          <HelpCircle className={iconSizeClasses[size]} />
        </button>
      )}
      
      <span id={tooltipId} className="sr-only">
        {config.label}: {percentage}% confidence. {config.description}
      </span>
    </div>
  );
};

// Utility function to calculate confidence from multiple factors
export const calculateConfidence = (
  verificationLevel: 'SELF_REPORTED' | 'MONITORED' | 'API_VERIFIED',
  daysSinceUpdate: number,
  sourceCount: number = 1,
  sourceAgreementRate: number = 1  // 0-1 ratio
): number => {
  // Base confidence from verification level (as ratios)
  const baseConfidence = {
    'API_VERIFIED': 0.95,
    'MONITORED': 0.75,
    'SELF_REPORTED': 0.50
  }[verificationLevel];

  // Freshness multiplier (lose up to 20% for stale data)
  // Data older than 30 days gets maximum penalty
  const freshnessMultiplier = Math.max(0.8, 1 - (daysSinceUpdate / 30) * 0.2);

  // Source bonus (up to 10% boost for multiple sources)
  // Caps at 5 sources for maximum bonus
  const sourceBonus = Math.min(0.1, (sourceCount - 1) * 0.025);

  // Agreement penalty (lose up to 15% if sources disagree)
  const agreementMultiplier = 0.85 + (sourceAgreementRate * 0.15);

  // Calculate final confidence as a ratio
  const confidence = (baseConfidence + sourceBonus) * freshnessMultiplier * agreementMultiplier;

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, confidence));
};