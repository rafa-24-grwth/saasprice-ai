'use client';

import { useId } from 'react';
import { FileText, Eye, CheckCircle } from 'lucide-react';
import type { VerificationLevel } from '@/types/pricing';

interface VerificationBadgeProps {
  level: VerificationLevel;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  level, 
  size = 'md',
  showTooltip = true 
}) => {
  const badgeId = useId();
  const tooltipId = `tooltip-${badgeId}`;

  const badges: Record<VerificationLevel, {
    icon: JSX.Element;
    label: string;
    color: string;
    tooltip: string;
  }> = {
    SELF_REPORTED: {
      icon: <FileText className="h-3 w-3" aria-hidden="true" />,
      label: 'Self-Reported',
      color: 'text-sp-text-muted border-sp-border',
      tooltip: 'Pricing submitted directly by vendor'
    },
    MONITORED: {
      icon: <Eye className="h-3 w-3" aria-hidden="true" />,
      label: 'Monitored',
      color: 'text-sp-accent border-sp-accent/30',
      tooltip: 'Nightly monitoring confirms vendor-submitted data'
    },
    API_VERIFIED: {
      icon: <CheckCircle className="h-3 w-3" aria-hidden="true" />,
      label: 'API Verified',
      color: 'text-sp-success border-sp-success/30',
      tooltip: 'Real-time verification via vendor API'
    }
  };

  const badge = badges[level] || badges.SELF_REPORTED;

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm'
  };

  const iconSizeClasses = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  // Update icon size based on badge size
  const IconComponent = badge.icon.type;
  const iconWithSize = <IconComponent className={iconSizeClasses[size]} aria-hidden="true" />;

  return (
    <div
      className={`inline-flex items-center gap-1 font-medium border rounded-full backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg ${badge.color} ${sizeClasses[size]}`}
      aria-label={`Verification level: ${badge.label}`}
      aria-describedby={showTooltip ? tooltipId : undefined}
      style={{
        boxShadow: level === 'API_VERIFIED' ? '0 0 20px rgba(16, 185, 129, 0.2)' :
                   level === 'MONITORED' ? '0 0 20px rgba(59, 130, 246, 0.2)' :
                   '0 0 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      {iconWithSize}
      <span>{badge.label}</span>
      {showTooltip && (
        <div id={tooltipId} className="sr-only">
          {badge.tooltip}
        </div>
      )}
    </div>
  );
};