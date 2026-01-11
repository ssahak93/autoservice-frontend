'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useServiceReviews } from '@/hooks/useReviews';

import { CreateReviewModal } from './CreateReviewModal';
import { ReviewCard } from './ReviewCard';

interface ReviewListProps {
  serviceId: string;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export function ReviewList({ serviceId }: ReviewListProps) {
  const t = useTranslations('reviews');
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const limit = 10;

  const { data, isLoading, isFetching } = useServiceReviews(serviceId, {
    page,
    limit,
    sortBy,
  });

  const reviews = data?.data || [];
  const pagination = data?.pagination;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: t('sort.newest') },
    { value: 'oldest', label: t('sort.oldest') },
    { value: 'highest', label: t('sort.highest') },
    { value: 'lowest', label: t('sort.lowest') },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <EmptyState icon={Star} title={t('noReviews')} description={t('noReviewsDescription')} />
    );
  }

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl font-semibold">
          {t('reviews')} ({pagination?.total || 0})
        </h3>
        <div className="flex items-center gap-2">
          {user && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1"
            >
              <Star className="h-4 w-4" />
              {t('writeReview')}
            </Button>
          )}
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              variant={sortBy === option.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setSortBy(option.value);
                setPage(1);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${sortBy}-${page}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ReviewCard review={review} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
          >
            {t('previous')}
          </Button>
          <span className="text-sm text-neutral-600">
            {t('page')} {page} {t('of')} {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages || isFetching}
          >
            {t('next')}
          </Button>
        </div>
      )}

      {/* Create Review Modal */}
      {showCreateModal && (
        <CreateReviewModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          serviceId={serviceId}
        />
      )}
    </div>
  );
}
