// components/monitoring/ActivityTimeline.tsx
interface TimelineData {
    hour: string;
    total: number;
    completed: number;
    failed: number;
    processing: number;
  }
  
  interface ActivityTimelineProps {
    data: TimelineData[];
    height?: number;
  }
  
  export function ActivityTimeline({ data, height = 160 }: ActivityTimelineProps) {
    const maxJobs = Math.max(...data.map(h => h.total), 1);
    
    const formatHour = (hourString: string) => {
      const date = new Date(hourString);
      return date.getHours().toString().padStart(2, '0') + ':00';
    };
  
    return (
      <div className="w-full">
        <div 
          className="flex items-end gap-0.5" 
          style={{ height: `${height}px` }}
        >
          {data.map((hour, idx) => {
            const barHeight = (hour.total / maxJobs) * 100;
            const completedHeight = (hour.completed / hour.total) * 100 || 0;
            const failedHeight = (hour.failed / hour.total) * 100 || 0;
            
            return (
              <div 
                key={idx} 
                className="flex-1 flex flex-col justify-end relative group"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div>{formatHour(hour.hour)}</div>
                  <div>Total: {hour.total}</div>
                  {hour.completed > 0 && <div className="text-green-400">✓ {hour.completed}</div>}
                  {hour.failed > 0 && <div className="text-red-400">✗ {hour.failed}</div>}
                </div>
                
                {/* Bar */}
                <div 
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors rounded-t relative overflow-hidden"
                  style={{ 
                    height: `${barHeight}%`, 
                    minHeight: hour.total > 0 ? '2px' : '0' 
                  }}
                >
                  {/* Success portion */}
                  {hour.completed > 0 && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-green-500 opacity-70"
                      style={{ height: `${completedHeight}%` }}
                    />
                  )}
                  {/* Failed portion */}
                  {hour.failed > 0 && (
                    <div 
                      className="absolute top-0 left-0 right-0 bg-red-500 opacity-70"
                      style={{ height: `${failedHeight}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>{formatHour(data[0]?.hour || '')}</span>
          <span className="text-center">Last 24 hours</span>
          <span>{formatHour(data[data.length - 1]?.hour || '')}</span>
        </div>
      </div>
    );
  }