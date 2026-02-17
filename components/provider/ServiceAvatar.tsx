'use client';

import { motion } from 'framer-motion';
import { Settings, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { memo } from 'react';

import { getTransition } from '@/lib/utils/animations';
import { getFileUrl } from '@/lib/utils/file';

interface ServiceAvatarProps {
  avatarFile?: { fileUrl: string } | null;
  name: string;
  isApproved?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'amber';
}

const sizeClasses = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-20 w-20',
};

const ringColors = {
  primary: 'ring-primary-200 dark:ring-primary-800',
  amber: 'ring-amber-200 dark:ring-amber-800',
};

const gradientColors = {
  primary: 'from-primary-400 to-primary-600',
  amber: 'from-amber-400 to-amber-600',
};

/**
 * Reusable service avatar component
 */
export const ServiceAvatar = memo(function ServiceAvatar({
  avatarFile,
  name,
  isApproved = false,
  size = 'md',
  variant = 'primary',
}: ServiceAvatarProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={getTransition(0.2)}
      className="relative flex-shrink-0"
    >
      {avatarFile ? (
        <div
          className={`relative ${sizeClasses[size]} overflow-hidden rounded-xl ring-2 ${ringColors[variant]}`}
        >
          <Image
            src={getFileUrl(avatarFile) || ''}
            alt={name}
            fill
            className="object-cover"
            loading="eager"
            unoptimized
            sizes="(max-width: 640px) 48px, 64px"
          />
        </div>
      ) : (
        <div
          className={`flex ${sizeClasses[size]} items-center justify-center rounded-xl bg-gradient-to-br ${gradientColors[variant]} ring-2 ${ringColors[variant]}`}
        >
          <Settings
            className={`${size === 'lg' ? 'h-10 w-10' : size === 'md' ? 'h-8 w-8' : 'h-6 w-6'} text-white`}
          />
        </div>
      )}
      {isApproved && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1 ring-2 ring-white dark:ring-gray-800"
        >
          <ShieldCheck className="h-3 w-3 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
});
