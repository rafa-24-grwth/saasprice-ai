// components/monitoring/LoadingSpinner.tsx
interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
  }
  
  export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
    const getSize = () => {
      switch (size) {
        case 'lg': return 'h-12 w-12';
        case 'sm': return 'h-4 w-4';
        default: return 'h-8 w-8';
      }
    };
  
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className={`${getSize()} animate-spin rounded-full border-b-2 border-blue-600`} />
        {message && (
          <p className="mt-4 text-gray-600">{message}</p>
        )}
      </div>
    );
  }