'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { useCreateReview } from '@/hooks/useReviews';
import { useUIStore } from '@/stores/uiStore';
import type { Visit } from '@/types';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit;
}

// Schema will be created inside component to use translations
const leaveReviewSchemaFactory = (
  t: (key: string, options?: { defaultValue?: string }) => string
) => {
  const ratingRequiredMsg = t('ratingRequired', { defaultValue: 'Please provide a rating' });
  return z.object({
    rating: z.number().min(1, ratingRequiredMsg).max(5),
    comment: z.string().optional(),
  });
};

type LeaveReviewFormData = z.infer<ReturnType<typeof leaveReviewSchemaFactory>>;

export function LeaveReviewModal({ isOpen, onClose, visit }: LeaveReviewModalProps) {
  const t = useTranslations('reviews');
  const showToast = useUIStore((state) => state.showToast);
  const [hoveredRating, setHoveredRating] = useState(0);
  const createReview = useCreateReview();
  const leaveReviewSchema = leaveReviewSchemaFactory(t);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<LeaveReviewFormData>({
    resolver: zodResolver(leaveReviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const selectedRating = watch('rating');

  const onSubmit = async (data: LeaveReviewFormData) => {
    try {
      await createReview.mutateAsync({
        visitId: visit.id,
        rating: data.rating,
        comment: data.comment,
      });
      showToast(t('reviewCreated'), 'success');
      reset();
      onClose();
    } catch (error: any) {
      if (error?.response?.data?.message) {
        showToast(error.response.data.message, 'error');
      } else {
        showToast(t('reviewError'), 'error');
      }
    }
  };

  const handleRatingClick = (rating: number) => {
    setValue('rating', rating, { shouldValidate: true });
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
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2"
          >
            <div className="glass-light mx-4 rounded-2xl p-6 shadow-2xl">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold">{t('writeReview')}</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                  aria-label={t('close')}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Visit Info */}
              <div className="mb-6 rounded-lg border border-primary-200 bg-gradient-to-r from-primary-50 to-primary-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary-900">
                      {t('reviewingVisit', {
                        defaultValue: 'Reviewing visit from',
                      })}
                    </p>
                    <p className="mt-1 text-sm text-primary-700">
                      {new Date(visit.scheduledDate || visit.preferredDate).toLocaleDateString()} at{' '}
                      {visit.scheduledTime || visit.preferredTime}
                    </p>
                    {visit.autoServiceProfile?.autoService && (
                      <p className="mt-1 text-xs text-primary-600">
                        {visit.autoServiceProfile.autoService.companyName ||
                          `${visit.autoServiceProfile.autoService.firstName || ''} ${visit.autoServiceProfile.autoService.lastName || ''}`.trim()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-neutral-700">
                    {t('rating')} *
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isActive = star <= (hoveredRating || selectedRating);
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingClick(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-all duration-200 hover:scale-125 active:scale-95"
                            aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
                          >
                            <Star
                              className={`h-10 w-10 transition-all duration-200 ${
                                isActive
                                  ? 'scale-110 fill-warning-400 text-warning-400'
                                  : 'fill-neutral-200 text-neutral-200'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    {selectedRating > 0 && (
                      <span className="text-sm font-medium text-neutral-600">
                        {selectedRating === 1 && t('ratingLabels.one', { defaultValue: 'Poor' })}
                        {selectedRating === 2 && t('ratingLabels.two', { defaultValue: 'Fair' })}
                        {selectedRating === 3 && t('ratingLabels.three', { defaultValue: 'Good' })}
                        {selectedRating === 4 &&
                          t('ratingLabels.four', { defaultValue: 'Very Good' })}
                        {selectedRating === 5 &&
                          t('ratingLabels.five', { defaultValue: 'Excellent' })}
                      </span>
                    )}
                  </div>
                  {errors.rating && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-error-600">
                      <span>⚠️</span>
                      {errors.rating.message}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    {t('comment')}{' '}
                    <span className="text-xs text-neutral-400">
                      ({t('optional', { defaultValue: 'Optional' })})
                    </span>
                  </label>
                  <textarea
                    {...register('comment')}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    placeholder={t('commentPlaceholder', {
                      defaultValue: 'Share your experience... (Optional)',
                    })}
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    {t('commentHint', {
                      defaultValue: 'Your feedback helps others make better decisions',
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
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
        </>
      )}
    </AnimatePresence>
  );
}
