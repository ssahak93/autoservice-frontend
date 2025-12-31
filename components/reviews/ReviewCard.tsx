'use client';

import { format } from 'date-fns';
import { Flag, Star } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
// import { useReportReview } from '@/hooks/useReviews';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const t = useTranslations('reviews');
  const { user } = useAuth();
  // const [showReportDialog, setShowReportDialog] = useState(false);
  // const reportReview = useReportReview();

  const driverName = review.driver
    ? `${review.driver.firstName} ${review.driver.lastName}`
    : t('anonymous');

  const handleReport = () => {
    // TODO: Show report dialog
    // setShowReportDialog(true);
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
    </div>
  );
}
