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
import { useVisits } from '@/hooks/useVisits';
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
    visitId: z.string().min(1, visitRequiredMsg),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
  });
};

type CreateReviewFormData = z.infer<ReturnType<typeof createReviewSchemaFactory>>;

export function CreateReviewModal({ isOpen, onClose, serviceId }: CreateReviewModalProps) {
  const t = useTranslations('reviews');
  const showToast = useUIStore((state) => state.showToast);
  const [hoveredRating, setHoveredRating] = useState(0);
  const createReview = useCreateReview();
  const createReviewSchema = createReviewSchemaFactory(t);

  // Get completed visits for this service
  const { data: visitsData } = useVisits({ status: 'completed' });
  const completedVisits =
    visitsData?.data?.filter((visit) => visit.autoServiceProfileId === serviceId) || [];

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

  const onSubmit = async (data: CreateReviewFormData) => {
    try {
      await createReview.mutateAsync(data);
      showToast(t('reviewCreated'), 'success');
      reset();
      onClose();
    } catch (error) {
      showToast(t('reviewError'), 'error');
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
                <h2 className="font-display text-2xl font-semibold">{t('createReview')}</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                  aria-label={t('close')}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Visit Selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    {t('selectVisit')}
                  </label>
                  <select
                    {...register('visitId')}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">{t('selectVisit')}</option>
                    {completedVisits.map((visit) => (
                      <option key={visit.id} value={visit.id}>
                        {new Date(visit.preferredDate).toLocaleDateString()} - {visit.preferredTime}
                      </option>
                    ))}
                  </select>
                  {errors.visitId && (
                    <p className="mt-1 text-sm text-error-600">{errors.visitId.message}</p>
                  )}
                  {completedVisits.length === 0 && (
                    <p className="mt-1 text-sm text-warning-600">{t('noCompletedVisits')}</p>
                  )}
                </div>

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
