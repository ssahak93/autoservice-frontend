'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { memo } from 'react';

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  count: number;
  iconColor?: string;
  badgeColor?: string;
  animated?: boolean;
}

/**
 * Reusable section header with icon, title, and count badge
 * Memoized to prevent unnecessary re-renders
 */
export const SectionHeader = memo(function SectionHeader({
  icon: Icon,
  title,
  count,
  iconColor = 'text-gray-500',
  badgeColor = 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  animated = false,
}: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {animated ? (
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </motion.div>
      ) : (
        <Icon className={`h-5 w-5 ${iconColor}`} />
      )}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColor}`}
      >
        {count}
      </motion.span>
    </div>
  );
});
