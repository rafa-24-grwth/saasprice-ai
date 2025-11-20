'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CompareError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Compare page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-sp-surface-0 flex items-center justify-center">
      <div className="container mx-auto p-8 max-w-md">
        <div className="bg-sp-surface-1 rounded-lg p-8 text-center">
          {/* Error icon */}
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center 
                        bg-sp-error/10 rounded-full">
            <svg 
              className="w-8 h-8 text-sp-error" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-sp-text-primary mb-2">
            Oops! Something went wrong
          </h2>
          
          <p className="text-sp-text-secondary mb-6">
            We couldn't load the vendor comparison data. This might be a temporary issue.
          </p>

          {/* Error details (in development) */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mb-6 p-3 bg-sp-surface-2 rounded text-left">
              <p className="text-xs text-sp-text-muted font-mono">
                {error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-6 py-2 bg-sp-accent text-white rounded-md 
                       hover:bg-sp-accent-hover transition-colors"
            >
              Try again
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-sp-surface-2 text-sp-text-primary rounded-md 
                       hover:bg-sp-surface-2/80 transition-colors"
            >
              Go to homepage
            </button>
          </div>

          {/* Help text */}
          <p className="text-xs text-sp-text-muted mt-6">
            If this problem persists, please contact support or check back later.
          </p>
        </div>
      </div>
    </div>
  );
}