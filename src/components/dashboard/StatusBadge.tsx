// components/monitoring/StatusBadge.tsx
interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md' | 'lg';
  }
  
  export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
    const getStatusStyles = () => {
      const baseStyles = {
        completed: 'bg-green-100 text-green-600',
        success: 'bg-green-100 text-green-600',
        healthy: 'bg-green-100 text-green-600',
        processing: 'bg-yellow-100 text-yellow-600',
        warning: 'bg-yellow-100 text-yellow-600',
        failed: 'bg-red-100 text-red-600',
        error: 'bg-red-100 text-red-600',
        critical: 'bg-red-100 text-red-800',
        pending: 'bg-blue-100 text-blue-600',
        unknown: 'bg-gray-100 text-gray-600',
      };
      
      return baseStyles[status as keyof typeof baseStyles] || baseStyles.unknown;
    };
  
    const getSizeStyles = () => {
      switch (size) {
        case 'lg': return 'px-3 py-1.5 text-sm';
        case 'md': return 'px-2.5 py-1 text-xs';
        default: return 'px-2 py-0.5 text-xs';
      }
    };
  
    return (
      <span className={`inline-flex items-center font-medium rounded-full ${getStatusStyles()} ${getSizeStyles()}`}>
        {status}
      </span>
    );
  }