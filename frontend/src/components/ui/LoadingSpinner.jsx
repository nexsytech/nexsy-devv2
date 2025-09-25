import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ fullPage = false, text = "Loading..." }) {
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-700 font-medium">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-600 text-sm">{text}</p>
      </div>
    </div>
  );
}