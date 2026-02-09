'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Car } from 'lucide-react';
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
  visit,
  isOpen,
  onClose,
  onComplete,
  isLoading = false,
}: CompleteVisitModalProps) {
  const t = useTranslations('dashboard.visits');
  const variants = getAnimationVariants();
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    const trimmedNotes = notes.trim();
    onComplete(trimmedNotes || undefined);
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
                {/* Vehicle Info */}
                {visit.vehicle && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-2 flex items-center gap-2">
                      <Car className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('complete.vehicle', { defaultValue: 'Vehicle' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {visit.vehicle.make} {visit.vehicle.model}
                      {visit.vehicle.year && ` ${visit.vehicle.year}`}
                      {visit.vehicle.licensePlate && ` (${visit.vehicle.licensePlate})`}
                    </p>
                  </div>
                )}

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
                    maxLength={500}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder={t('complete.notesPlaceholder', {
                      defaultValue: 'Add completion notes...',
                    })}
                  />
                  {notes.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {notes.length}/500 {t('complete.characters', { defaultValue: 'characters' })}
                    </p>
                  )}
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
