import React from 'react';

const LoadingSkeleton = ({ type = 'schedule' }) => {
  if (type === 'schedule') {
    return (
      <div className="min-h-screen bg-white flex">
        {/* Left Sidebar Skeleton */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-10 w-full bg-gray-300 rounded animate-pulse"></div>
              <div className="h-10 w-full bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="p-6 flex-1">
            <div className="h-6 w-24 bg-gray-300 rounded animate-pulse mb-4"></div>
            <div className="space-y-1">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="h-8 bg-gray-300 rounded animate-pulse"></div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => (
                  <div key={i} className="h-8 bg-gray-300 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-8 w-48 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-32 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="space-y-4">
              {/* Room Headers */}
              <div className="flex space-x-4">
                <div className="w-20 h-12 bg-gray-300 rounded animate-pulse"></div>
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex-1 h-12 bg-gray-300 rounded animate-pulse"></div>
                ))}
              </div>

              {/* Time Slots */}
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="w-20 h-16 bg-gray-300 rounded animate-pulse"></div>
                  {Array.from({ length: 5 }, (_, j) => (
                    <div key={j} className="flex-1 h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'simple') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
