'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { getAnimationVariants } from '@/lib/utils/animations';
import type { Visit } from '@/types';

interface CancelVisitModalProps {
  visit: Visit;
  isOpen: boolean;
  onClose: () => void;
  onCancel: (reason: string) => void;
  isLoading?: boolean;
}

export function CancelVisitModal({
  visit: _visit,
  isOpen,
  onClose,
  onCancel,
  isLoading = false,
}: CancelVisitModalProps) {
  const t = useTranslations('dashboard.visits');
  const variants = getAnimationVariants();
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!reason.trim() || reason.trim().length < 3) {
      return;
    }
    onCancel(reason.trim());
    setReason('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={variants.fadeIn.initial}
            animate={variants.fadeIn.animate}
            exit={variants.fadeIn.exit}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={variants.modal.initial}
              animate={variants.modal.animate}
              exit={variants.modal.exit}
              className="glass-light w-full max-w-md rounded-xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('cancelModal.title', { defaultValue: 'Cancel Visit' })}
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  {t('cancelModal.confirmation', {
                    defaultValue: 'Are you sure you want to cancel this visit?',
                  })}
                </p>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('cancelModal.reason', { defaultValue: 'Cancellation Reason' })} *
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    required
                    minLength={3}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder={t('cancelModal.reasonPlaceholder', {
                      defaultValue: 'Please provide a reason (minimum 3 characters)...',
                    })}
                  />
                  {reason.length > 0 && reason.length < 3 && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {t('cancelModal.minLength', {
                        defaultValue: 'Reason must be at least 3 characters',
                      })}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} fullWidth>
                    {t('cancelModal.back', { defaultValue: 'Back' })}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    disabled={!reason.trim() || reason.trim().length < 3}
                    fullWidth
                  >
                    {t('cancelModal.confirm', { defaultValue: 'Cancel Visit' })}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
