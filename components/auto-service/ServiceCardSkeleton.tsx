'use client';

import { motion } from 'framer-motion';

interface ServiceCardSkeletonProps {
  count?: number;
  layout?: 'list' | 'grid';
  className?: string;
}

/**
 * Skeleton loader for service cards
 * Supports both list and grid layouts
 */
export function ServiceCardSkeleton({
  count = 3,
  layout = 'list',
  className = '',
}: ServiceCardSkeletonProps) {
  const containerClass = layout === 'grid' ? 'grid grid-cols-1 gap-6 md:grid-cols-2' : 'space-y-4';

  return (
    <div className={`${containerClass} ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={
            layout === 'grid'
              ? 'glass-light h-64 animate-pulse rounded-xl'
              : 'h-32 animate-pulse rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700'
          }
        />
      ))}
    </div>
  );
}
