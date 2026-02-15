export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Greeting skeleton */}
      <div>
        <div className="h-8 bg-secondary-200 rounded-lg w-64 mb-3" />
        <div className="h-5 bg-secondary-200 rounded-lg w-96" />
      </div>

      {/* Progress tracker skeleton */}
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="h-5 bg-secondary-200 rounded w-40 mb-8" />
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 bg-secondary-200 rounded-full" />
              <div className="h-4 bg-secondary-200 rounded w-24 mt-3" />
            </div>
          ))}
        </div>
      </div>

      {/* Details skeleton */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="h-5 bg-secondary-200 rounded w-32 mb-4" />
        <div className="bg-secondary-50 rounded-xl p-4">
          <div className="h-4 bg-secondary-200 rounded w-48 mb-2" />
          <div className="h-4 bg-secondary-200 rounded w-32" />
        </div>
      </div>
    </div>
  )
}
