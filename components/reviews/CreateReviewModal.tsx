'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { useCreateReview } from '@/hooks/useReviews';
import { useVisits } from '@/hooks/useVisits';
import { formatDate } from '@/lib/utils/date';
import { commonValidations } from '@/lib/utils/validation';
import { useUIStore } from '@/stores/uiStore';

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
}

// Schema will be created inside component to use translations
const createReviewSchemaFactory = (
  t: (key: string, options?: { defaultValue?: string }) => string
) => {
  const visitRequiredMsg = t('visitRequired', { defaultValue: 'Visit is required' });
  return z.object({
    visitId: commonValidations.requiredString(visitRequiredMsg),
    rating: commonValidations.rating(visitRequiredMsg),
    comment: z.string().optional(),
  });
};

type CreateReviewFormData = z.infer<ReturnType<typeof createReviewSchemaFactory>>;

export function CreateReviewModal({ isOpen, onClose, serviceId }: CreateReviewModalProps) {
  const t = useTranslations('reviews');
  const locale = useLocale();
  const showToast = useUIStore((state) => state.showToast);
  const [hoveredRating, setHoveredRating] = useState(0);
  const createReview = useCreateReview();
  const createReviewSchema = createReviewSchemaFactory(t);

  // Get completed visits for this service - only when modal is open
  const { data: visitsData } = useVisits({ status: 'completed' }, { enabled: isOpen });

  // Filter visits: only completed visits for this service that don't have a review yet
  // and where scheduled date has passed
  const availableVisits = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      visitsData?.data?.filter((visit) => {
        if (
          visit.autoServiceProfileId !== serviceId ||
          visit.status !== 'completed' ||
          visit.review
        ) {
          return false;
        }
        // Check if scheduled date has passed
        const scheduledDate = visit.scheduledDate || visit.preferredDate;
        if (scheduledDate) {
          const visitDate = new Date(scheduledDate);
          visitDate.setHours(0, 0, 0, 0);
          return visitDate <= today;
        }
        return true;
      }) || []
    );
  }, [visitsData?.data, serviceId]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreateReviewFormData>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const selectedRating = watch('rating');
  const selectedVisitId = watch('visitId');

  // Auto-select visit if there's only one available
  useEffect(() => {
    if (isOpen && availableVisits.length === 1 && !selectedVisitId) {
      setValue('visitId', availableVisits[0].id, { shouldValidate: true });
    }
  }, [isOpen, availableVisits, selectedVisitId, setValue]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setHoveredRating(0);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: CreateReviewFormData) => {
    try {
      await createReview.mutateAsync(data);
      showToast(t('reviewCreated'), 'success');
      reset();
      setHoveredRating(0);
      onClose();
    } catch {
      showToast(t('reviewError'), 'error');
    }
  };

  const handleRatingClick = (rating: number) => {
    setValue('rating', rating, { shouldValidate: true });
  };

  const handleClose = () => {
    reset();
    setHoveredRating(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg"
            >
              <div className="glass-light max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-2xl font-semibold">{t('createReview')}</h2>
                  <button
                    onClick={handleClose}
                    className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                    aria-label={t('close')}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Visit Selection - Only show if more than one visit */}
                  {availableVisits.length > 1 && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">
                        {t('selectVisit')}
                      </label>
                      <select
                        {...register('visitId')}
                        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      >
                        <option value="">{t('selectVisit')}</option>
                        {availableVisits.map((visit) => {
                          const dateStr = visit.preferredDate || visit.scheduledDate;
                          const timeStr = visit.preferredTime || visit.scheduledTime;
                          return (
                            <option key={visit.id} value={visit.id}>
                              {dateStr ? formatDate(dateStr, locale) : ''}{' '}
                              {timeStr ? `- ${timeStr}` : ''}
                            </option>
                          );
                        })}
                      </select>
                      {errors.visitId && (
                        <p className="mt-1 text-sm text-error-600">{errors.visitId.message}</p>
                      )}
                    </div>
                  )}

                  {/* Show visit info if only one visit or if visit is selected */}
                  {(availableVisits.length === 1 || selectedVisitId) && (
                    <div className="rounded-lg border border-primary-200 bg-gradient-to-r from-primary-50 to-primary-100 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-primary-900">
                            {t('reviewingVisit', {
                              defaultValue: 'Reviewing visit from',
                            })}
                          </p>
                          {(() => {
                            const visit =
                              availableVisits.find((v) => v.id === selectedVisitId) ||
                              availableVisits[0];
                            if (!visit) return null;
                            const dateStr = visit.preferredDate || visit.scheduledDate;
                            const timeStr = visit.preferredTime || visit.scheduledTime;
                            return (
                              <p className="mt-1 text-sm text-primary-700">
                                {dateStr ? formatDate(dateStr, locale) : ''}{' '}
                                {timeStr ? `at ${timeStr}` : ''}
                              </p>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hidden input for single visit */}
                  {availableVisits.length === 1 && (
                    <input type="hidden" {...register('visitId')} value={availableVisits[0].id} />
                  )}

                  {availableVisits.length === 0 && (
                    <div className="rounded-lg border border-warning-200 bg-warning-50 p-4">
                      <p className="text-sm text-warning-800">{t('noCompletedVisits')}</p>
                    </div>
                  )}

                  {/* Rating */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      {t('rating')} *
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isActive = star <= (hoveredRating || selectedRating);
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingClick(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-8 w-8 transition-colors ${
                                isActive
                                  ? 'fill-warning-400 text-warning-400'
                                  : 'fill-neutral-200 text-neutral-200'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    {errors.rating && (
                      <p className="mt-1 text-sm text-error-600">{errors.rating.message}</p>
                    )}
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      {t('comment')}
                    </label>
                    <textarea
                      {...register('comment')}
                      rows={4}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      placeholder={t('comment')}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1"
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={createReview.isPending}
                      isLoading={createReview.isPending}
                    >
                      {t('submitReview')}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
