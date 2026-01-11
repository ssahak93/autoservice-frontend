'use client';

// Import only needed functions from date-fns for tree shaking
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns/format';
import { Flag, Star } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { useReportReview } from '@/hooks/useReviews';
import { useUIStore } from '@/stores/uiStore';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
}

const reportSchema = z.object({
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be less than 500 characters'),
});

type ReportFormData = z.infer<typeof reportSchema>;

export function ReviewCard({ review }: ReviewCardProps) {
  const t = useTranslations('reviews');
  const { user } = useAuth();
  const { showToast } = useUIStore();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const reportReview = useReportReview();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
  });

  const driverName = review.driver
    ? `${review.driver.firstName} ${review.driver.lastName}`
    : t('anonymous');

  const handleReport = () => {
    setShowReportDialog(true);
  };

  const handleCloseDialog = () => {
    setShowReportDialog(false);
    reset();
  };

  const onSubmit = async (data: ReportFormData) => {
    try {
      await reportReview.mutateAsync({
        reviewId: review.id,
        reason: data.reason,
      });
      showToast(t('reportSubmitted', { defaultValue: 'Review reported successfully' }), 'success');
      handleCloseDialog();
    } catch (error) {
      showToast(t('reportError', { defaultValue: 'Error reporting review' }), 'error');
    }
  };

  return (
    <div className="glass-light rounded-lg p-6 transition-all hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-neutral-200">
            {review.driver?.avatarFile?.fileUrl ? (
              <Image
                src={review.driver.avatarFile.fileUrl}
                alt={driverName}
                fill
                className="object-cover"
                sizes="48px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary-100 text-primary-600">
                <span className="text-lg font-semibold">{driverName.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Review Info */}
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h4 className="font-semibold text-neutral-900">{driverName}</h4>
            </div>

            {/* Rating Stars */}
            <div className="mb-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.rating
                      ? 'fill-warning-400 text-warning-400'
                      : 'fill-neutral-200 text-neutral-200'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-neutral-600">{review.rating}/5</span>
            </div>

            {/* Date */}
            <p className="text-sm text-neutral-500">{format(new Date(review.createdAt), 'PP')}</p>
          </div>
        </div>

        {/* Report Button */}
        {user && user.id !== review.driverId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReport}
            className="text-neutral-400 hover:text-error-500"
            aria-label={t('report')}
          >
            <Flag className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Comment */}
      {review.comment && <p className="whitespace-pre-wrap text-neutral-700">{review.comment}</p>}

      {/* Report Dialog */}
      <Modal
        isOpen={showReportDialog}
        onClose={handleCloseDialog}
        title={t('reportReview', { defaultValue: 'Report Review' })}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('reportReason', { defaultValue: 'Reason for reporting' })}
            </label>
            <textarea
              {...register('reason')}
              rows={4}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              placeholder={t('reportReasonPlaceholder', {
                defaultValue: 'Please explain why you are reporting this review...',
              })}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-error-500">{errors.reason.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseDialog}
              disabled={isSubmitting}
            >
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? t('submitting', { defaultValue: 'Submitting...' })
                : t('submitReport', { defaultValue: 'Submit Report' })}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
