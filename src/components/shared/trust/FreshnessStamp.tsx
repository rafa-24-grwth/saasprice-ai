'use client';

import { Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, differenceInDays, differenceInHours } from 'date-fns';
import * as Tooltip from '@radix-ui/react-tooltip';

export const FRESHNESS_WARN_DAYS = 3;
export const FRESHNESS_STALE_DAYS = 7;

interface FreshnessStampProps {
  updatedAt: Date | string;
  sourceCount?: number;
  majorityMatch?: number;
  showSources?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isUpdating?: boolean;
}

export const FreshnessStamp: React.FC<FreshnessStampProps> = ({
  updatedAt,
  sourceCount,
  majorityMatch,
  showSources = true,
  size = 'md',
  isUpdating = false
}) => {
  // Convert string to Date if needed
  const updateDate = typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt;
  
  // Calculate freshness
  const daysSince = differenceInDays(new Date(), updateDate);
  const hoursSince = differenceInHours(new Date(), updateDate);
  
  // Determine color based on age using design tokens
  const textColor =
    daysSince > FRESHNESS_STALE_DAYS ? 'text-sp-error' :
    daysSince > FRESHNESS_WARN_DAYS ? 'text-sp-warning' :
    'text-sp-text-secondary';

  // Format time ago
  const timeAgo = hoursSince < 1 
    ? 'Just now' 
    : formatDistanceToNow(updateDate, { addSuffix: true });

  // Size classes
  const sizeClasses = {
    sm: 'text-xs gap-0.5',
    md: 'text-sm gap-1',
    lg: 'text-base gap-1.5'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Build the exact time for tooltip
  const exactTime = updateDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  // Show warning icon if stale
  const showWarning = daysSince > FRESHNESS_WARN_DAYS;

  const stampContent = (
    <div
      className={`flex items-center ${sizeClasses[size]} ${textColor}`}
      aria-live={isUpdating ? 'polite' : undefined}
      aria-atomic={isUpdating ? 'true' : undefined}
    >
      {showWarning ? (
        <AlertCircle className={iconSizeClasses[size]} aria-hidden="true" />
      ) : (
        <Clock className={iconSizeClasses[size]} aria-hidden="true" />
      )}
      
      <span className="font-medium">{timeAgo}</span>
      
      {showSources && sourceCount && majorityMatch !== undefined && (
        <>
          <span className="text-sp-border">•</span>
          <span className="text-sp-text-muted">
            {majorityMatch}/{sourceCount} sources agree
          </span>
        </>
      )}
    </div>
  );

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {stampContent}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content 
            className="
              rounded-md px-3 py-1.5 text-sm 
              bg-sp-surface-2 text-sp-text-primary 
              shadow-md z-50
              data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade
              data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade
              data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade
              data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade
            "
            sideOffset={5}
          >
            Last updated: {exactTime}
            <Tooltip.Arrow className="fill-sp-surface-2" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};