// components/monitoring/MetricList.tsx
interface MetricItem {
    label: string;
    value: string | number;
    color?: string;
  }
  
  interface MetricListProps {
    items: MetricItem[];
    orientation?: 'horizontal' | 'vertical';
  }
  
  export function MetricList({ items, orientation = 'vertical' }: MetricListProps) {
    const containerClass = orientation === 'horizontal' 
      ? 'flex flex-wrap gap-4' 
      : 'space-y-1';
    
    const itemClass = orientation === 'horizontal'
      ? 'flex items-center gap-2'
      : 'flex justify-between';
  
    return (
      <div className={containerClass}>
        {items.map((item, idx) => (
          <div key={idx} className={`${itemClass} text-sm`}>
            <span className={item.color || 'text-gray-600'}>{item.label}:</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }