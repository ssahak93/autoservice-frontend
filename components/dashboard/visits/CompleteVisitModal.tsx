'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { getAnimationVariants } from '@/lib/utils/animations';
import type { Visit } from '@/types';

interface CompleteVisitModalProps {
  visit: Visit;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (notes?: string) => void;
  isLoading?: boolean;
}

export function CompleteVisitModal({
  visit: _visit,
  isOpen,
  onClose,
  onComplete,
  isLoading = false,
}: CompleteVisitModalProps) {
  const t = useTranslations('dashboard.visits');
  const variants = getAnimationVariants();
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onComplete(notes || undefined);
    setNotes('');
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
                  {t('complete.title', { defaultValue: 'Complete Visit' })}
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
                  {t('complete.confirmation', {
                    defaultValue: 'Are you sure you want to mark this visit as completed?',
                  })}
                </p>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('complete.notes', { defaultValue: 'Completion Notes (optional)' })}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder={t('complete.notesPlaceholder', {
                      defaultValue: 'Add completion notes...',
                    })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} fullWidth>
                    {t('cancel', { defaultValue: 'Cancel' })}
                  </Button>
                  <Button onClick={handleSubmit} isLoading={isLoading} fullWidth>
                    {t('complete.confirm', { defaultValue: 'Complete Visit' })}
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
