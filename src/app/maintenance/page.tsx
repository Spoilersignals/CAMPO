"use client";

import { Construction, Clock, ArrowLeft } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Icon */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 shadow-2xl shadow-orange-500/30">
          <Construction className="h-12 w-12 text-white animate-bounce" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">
          We&apos;re Working On It!
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-purple-200 mb-8">
          ComradeZone is currently under maintenance. We&apos;re making things even better for you.
        </p>

        {/* Status card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex items-center justify-center gap-3 text-white mb-4">
            <Clock className="h-5 w-5 text-yellow-400" />
            <span className="text-lg font-medium">Expected Downtime</span>
          </div>
          <p className="text-purple-200">
            We&apos;ll be back shortly. Thanks for your patience!
          </p>
        </div>

        {/* Features list */}
        <div className="text-left bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-3">What we&apos;re improving:</h3>
          <ul className="space-y-2 text-purple-200 text-sm">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Performance enhancements
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              New features coming soon
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Bug fixes and improvements
            </li>
          </ul>
        </div>

        {/* Social links */}
        <div className="mt-8 text-purple-300 text-sm">
          <p>Follow us for updates</p>
          <p className="text-white font-medium mt-1">@ComradeZone</p>
        </div>
      </div>
    </div>
  );
}
