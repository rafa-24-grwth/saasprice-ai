// components/monitoring/ProgressBar.tsx
interface ProgressBarProps {
    value: number;
    max: number;
    label?: string;
    showPercentage?: boolean;
    colorThresholds?: {
      danger: number;
      warning: number;
    };
  }
  
  export function ProgressBar({ 
    value, 
    max, 
    label, 
    showPercentage = true,
    colorThresholds = { danger: 90, warning: 70 }
  }: ProgressBarProps) {
    const percentage = Math.min((value / max) * 100, 100);
    
    const getColor = () => {
      if (percentage > colorThresholds.danger) return 'bg-red-600';
      if (percentage > colorThresholds.warning) return 'bg-yellow-600';
      return 'bg-green-600';
    };
  
    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between text-sm mb-1">
            <span>{label}</span>
            {showPercentage && <span>{percentage.toFixed(0)}%</span>}
          </div>
        )}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }