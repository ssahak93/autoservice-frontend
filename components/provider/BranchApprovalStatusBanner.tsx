'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

import type { ProviderBranch } from '@/lib/services/provider-branch.service';

interface BranchApprovalStatusBannerProps {
  branch: ProviderBranch;
  onDismiss?: () => void;
}

export function BranchApprovalStatusBanner({ branch, onDismiss }: BranchApprovalStatusBannerProps) {
  const t = useTranslations('myService.approval');
  const dismissedKey = `approvalStatusBannerDismissed_${branch.id}`;
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const wasDismissed = sessionStorage.getItem(dismissedKey) === 'true';
      setIsDismissed(wasDismissed);
    }
  }, [dismissedKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(dismissedKey, 'true');
    }
    onDismiss?.();
  };

  // Don't show if dismissed
  if (isDismissed) {
    return null;
  }

  // During SSR and before mount, return null to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Show approved banner
  if (branch.provider?.isApproved) {
    return (
      <motion.div
        suppressHydrationWarning
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6 rounded-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 shadow-lg dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {t('approvedTitle', { defaultValue: 'Auto Service Approved' })}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('approvedMessage', {
                defaultValue:
                  'Your auto service has been approved and is now visible in search results.',
              })}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            aria-label={t('dismiss', { defaultValue: 'Dismiss' })}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Show rejection banner with reason
  if (!branch.provider?.isApproved && branch.provider?.rejectionReason) {
    return (
      <motion.div
        suppressHydrationWarning
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6 rounded-xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-6 shadow-lg dark:border-red-800 dark:from-red-900/20 dark:to-rose-900/20"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {t('rejectedTitle', { defaultValue: 'Auto Service Rejected' })}
            </h3>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              {t('rejectedMessage', {
                defaultValue:
                  'Your auto service has been rejected. Please review the reason below and update your profile.',
              })}
            </p>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {t('rejectionReason', { defaultValue: 'Rejection Reason' })}:
              </p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {branch.provider?.rejectionReason}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            aria-label={t('dismiss', { defaultValue: 'Dismiss' })}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Show pending approval banner
  return (
    <motion.div
      suppressHydrationWarning
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6 rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-6 shadow-lg dark:border-amber-800 dark:from-amber-900/20 dark:to-yellow-900/20"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {t('pendingTitle', { defaultValue: 'Pending Approval' })}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('pendingMessage', {
              defaultValue:
                'Your auto service profile is pending admin approval. It will be visible in search results once approved.',
            })}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label={t('dismiss', { defaultValue: 'Dismiss' })}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}
