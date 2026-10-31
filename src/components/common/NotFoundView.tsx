/**
 * CRYPTORA 404 Not Found View
 * Minimal monochrome error route handler.
 */

import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface NotFoundProps {
  onNavigateHome: () => void;
}

export const NotFoundView: React.FC<NotFoundProps> = ({ onNavigateHome }) => {
  return (
    <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-6">
      <div className="w-12 h-12 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center mx-auto text-[#111111]">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[#111111]">
          404 · Route Not Found
        </h1>
        <p className="text-xs text-[#666666] leading-relaxed max-w-sm mx-auto">
          The requested URL does not match any authenticated cryptographic endpoint or verified page in CRYPTORA.
        </p>
      </div>

      <div>
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-[#1C1C1C] text-white text-xs font-semibold rounded transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </button>
      </div>
    </div>
  );
};
