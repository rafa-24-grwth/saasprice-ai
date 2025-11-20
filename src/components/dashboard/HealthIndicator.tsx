// components/monitoring/HealthIndicator.tsx
interface HealthIndicatorProps {
    health: 'healthy' | 'warning' | 'error' | 'critical' | 'unknown';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
  }
  
  export function HealthIndicator({ health, size = 'sm', showLabel = false }: HealthIndicatorProps) {
    const getColor = () => {
      switch (health) {
        case 'healthy': return 'bg-green-500';
        case 'warning': return 'bg-yellow-500';
        case 'error': return 'bg-red-500';
        case 'critical': return 'bg-red-700';
        default: return 'bg-gray-400';
      }
    };
  
    const getSize = () => {
      switch (size) {
        case 'lg': return 'w-3 h-3';
        case 'md': return 'w-2.5 h-2.5';
        default: return 'w-2 h-2';
      }
    };
  
    return (
      <div className="flex items-center gap-2">
        <div className={`${getSize()} rounded-full ${getColor()} animate-pulse`} />
        {showLabel && (
          <span className="text-sm capitalize text-gray-600">{health}</span>
        )}
      </div>
    );
  }