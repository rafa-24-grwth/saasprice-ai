// components/monitoring/MethodUsageChart.tsx
interface MethodUsageProps {
    methodUsage: Record<string, number>;
    costByMethod: Record<string, number>;
    totalJobs: number;
  }
  
  export function MethodUsageChart({ methodUsage, costByMethod, totalJobs }: MethodUsageProps) {
    const methods = Object.entries(methodUsage).sort((a, b) => b[1] - a[1]);
    
    const getMethodColor = (method: string) => {
      const colors: Record<string, string> = {
        playwright: 'bg-purple-600',
        firecrawl: 'bg-orange-600',
        vision: 'bg-blue-600',
      };
      return colors[method.toLowerCase()] || 'bg-gray-600';
    };
  
    return (
      <div className="space-y-3">
        {methods.map(([method, count]) => {
          const cost = costByMethod[method] || 0;
          const percentage = (count / totalJobs) * 100;
          
          return (
            <div key={method} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-medium capitalize text-sm">{method}</span>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{count}</span> jobs • 
                  <span className="font-medium ml-1">${cost.toFixed(2)}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getMethodColor(method)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {percentage.toFixed(1)}% of total
              </div>
            </div>
          );
        })}
      </div>
    );
  }