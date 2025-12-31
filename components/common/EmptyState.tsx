'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'outline' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * EmptyState Component
 *
 * Single Responsibility: Displays empty state with icon, message, and actions
 * Open/Closed: Can be extended with new action types without modifying core
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center px-4 py-12 text-center ${className || ''}`}
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-6 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 p-6"
        >
          <Icon className="h-12 w-12 text-neutral-400" strokeWidth={1.5} />
        </motion.div>
      )}
      <h3 className="mb-3 font-display text-xl font-semibold text-neutral-900 sm:text-2xl">
        {title}
      </h3>
      {description && (
        <p className="mb-8 max-w-md text-sm text-neutral-600 sm:text-base">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          {action && (
            <Button variant={action.variant || 'primary'} onClick={action.onClick} size="md">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick} size="md">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
