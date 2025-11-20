// components/ui/StatCard.tsx
import React from 'react';
import { colors, shadows } from '@/theme/colors';

interface StatCardProps {
  label: string;
  value: string;
  freshness?: string;
  accent?: 'green' | 'blue' | 'purple';
  footnote?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  freshness,
  accent,
  footnote
}) => {
  const getAccentColor = () => {
    switch (accent) {
      case 'green':
        return colors.green[600];
      case 'blue':
        return colors.blue[600];
      case 'purple':
        return colors.purple[600];
      default:
        return colors.ink[900];
    }
  };

  return (
    <div 
      className="rounded-2xl bg-white p-6"
      style={{ boxShadow: shadows.card }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div 
            className="text-2xl sm:text-3xl font-bold"
            style={{ 
              color: getAccentColor(),
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {value}
          </div>
          <div 
            className="mt-1 text-sm"
            style={{ color: colors.slate[600] }}
          >
            {label}
          </div>
          {footnote && (
            <div 
              className="mt-1 text-xs"
              style={{ color: colors.slate[600] }}
            >
              {footnote}
            </div>
          )}
        </div>
        {freshness && (
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
            style={{ 
              backgroundColor: colors.cyan[50],
              color: colors.cyan[500]
            }}
          >
            <span 
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: colors.cyan[500] }}
            />
            Updated {freshness}
          </span>
        )}
      </div>
    </div>
  );
};