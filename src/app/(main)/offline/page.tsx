"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
          <WifiOff className="h-12 w-12 text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          You&apos;re Offline
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          It looks like you&apos;ve lost your internet connection. 
          Some features may not be available until you&apos;re back online.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-medium hover:opacity-90 transition-all"
        >
          <RefreshCw className="h-5 w-5" />
          Try Again
        </button>
      </div>
    </div>
  );
}
