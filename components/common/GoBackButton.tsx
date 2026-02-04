'use client';

import { ArrowLeft } from 'lucide-react';

interface GoBackButtonProps {
  label: string;
}

export function GoBackButton({ label }: GoBackButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.history.back();
        }
      }}
      className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 hover:underline"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
