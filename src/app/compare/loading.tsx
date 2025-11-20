export default function CompareLoading() {
    return (
      <div className="min-h-screen bg-sp-surface-0">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-9 w-64 bg-sp-surface-1 rounded animate-pulse mb-3"></div>
            <div className="h-6 w-96 bg-sp-surface-1 rounded animate-pulse"></div>
          </div>
  
          {/* Trust indicators skeleton */}
          <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-sp-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-5 w-32 bg-sp-surface-1 rounded animate-pulse"></div>
            ))}
          </div>
  
          {/* Form skeleton */}
          <div className="space-y-8">
            {/* Vendor selection skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-sp-surface-1 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-sp-surface-1 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-sp-surface-1 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-sp-surface-1 rounded animate-pulse"></div>
              </div>
            </div>
  
            {/* Configuration skeleton */}
            <div className="bg-sp-surface-1 rounded-lg p-6">
              <div className="h-6 w-48 bg-sp-surface-2 rounded animate-pulse mb-6"></div>
              
              {/* Seats input skeleton */}
              <div className="space-y-2 mb-6">
                <div className="h-4 w-32 bg-sp-surface-2 rounded animate-pulse"></div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-32 bg-sp-surface-2 rounded animate-pulse"></div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-8 w-12 bg-sp-surface-2 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
  
              {/* Billing period skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-32 bg-sp-surface-2 rounded animate-pulse"></div>
                <div className="flex gap-4">
                  <div className="h-10 w-24 bg-sp-surface-2 rounded animate-pulse"></div>
                  <div className="h-10 w-32 bg-sp-surface-2 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
  
            {/* Compare button skeleton */}
            <div className="flex justify-center">
              <div className="h-12 w-48 bg-sp-surface-2 rounded animate-pulse"></div>
            </div>
  
            {/* Info box skeleton */}
            <div className="bg-sp-surface-1 border border-sp-border rounded-lg p-4">
              <div className="space-y-2">
                <div className="h-4 w-full bg-sp-surface-2 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-sp-surface-2 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-sp-surface-2 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }