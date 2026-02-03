"use client";

import { useState } from "react";
import { AlertTriangle, X, Shield, ExternalLink } from "lucide-react";
import Link from "next/link";

export function CautionAlert() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-40 animate-slide-up">
      <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 shadow-2xl shadow-amber-500/30">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4 text-white" />
        </button>
        
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm">Stay Safe on ComradeZone</h3>
            <p className="text-white/90 text-xs mt-1">
              Always meet in public places. Never share personal financial info. Report suspicious activity.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <Link
                href="/safety-tips"
                className="inline-flex items-center gap-1 text-xs font-medium text-white hover:underline"
              >
                <Shield className="h-3 w-3" />
                Safety Tips
              </Link>
              <Link
                href="/report"
                className="inline-flex items-center gap-1 text-xs font-medium text-white hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Report Issue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SafetyBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>
            <strong>Safety Reminder:</strong> Meet in public, verify before paying, and report suspicious users.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-800 p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
