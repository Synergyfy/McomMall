'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Layout Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 font-sans antialiased">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-900">
              Application Error
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              A critical error occurred. Please reload the page to restore application state.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
