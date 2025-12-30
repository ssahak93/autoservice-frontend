import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { reviewsService, type CreateReviewDto, type ReviewFilters } from '@/lib/services/reviews.service';

/**
 * Hook to get reviews for a specific service
 */
export function useServiceReviews(serviceId: string, filters?: ReviewFilters) {
  return useQuery({
    queryKey: ['reviews', 'service', serviceId, filters],
    queryFn: () => reviewsService.getServiceReviews(serviceId, filters),
    enabled: !!serviceId,
  });
}

/**
 * Hook to get user's reviews
 */
export function useUserReviews() {
  return useQuery({
    queryKey: ['reviews', 'user'],
    queryFn: () => reviewsService.getUserReviews(),
  });
}

/**
 * Hook to create a review
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateReviewDto) => reviewsService.createReview(dto),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['reviews', 'service', data.autoServiceProfileId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['services', data.autoServiceProfileId] });
    },
  });
}

/**
 * Hook to report a review
 */
export function useReportReview() {
  return useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason: string }) =>
      reviewsService.reportReview(reviewId, reason),
  });
}

