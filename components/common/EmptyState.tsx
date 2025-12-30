'use client';

import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-neutral-100 p-4">
          <Icon className="h-8 w-8 text-neutral-400" />
        </div>
      )}
      <h3 className="mb-2 font-display text-lg font-semibold text-neutral-900">{title}</h3>
      {description && <p className="mb-6 text-sm text-neutral-600">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

