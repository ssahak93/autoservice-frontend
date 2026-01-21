'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log critical error to error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="text-center">
            <h1 className="mb-4 font-display text-6xl font-bold text-error-600 sm:text-8xl">500</h1>
            <h2 className="mb-4 font-display text-2xl font-semibold text-neutral-900 sm:text-3xl">
              Critical Error
            </h2>
            <p className="mb-8 max-w-md text-lg text-neutral-600">
              A critical error occurred. Please refresh the page or contact support if the problem
              persists.
            </p>
            <button
              onClick={reset}
              className="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
