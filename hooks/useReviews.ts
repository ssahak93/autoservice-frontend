import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryConfig } from '@/lib/api/query-config';
import {
  reviewsService,
  type CreateReviewDto,
  type ReviewFilters,
} from '@/lib/services/reviews.service';

/**
 * Hook to get reviews for a specific service
 */
export function useServiceReviews(serviceId: string, filters?: ReviewFilters) {
  return useQuery({
    queryKey: ['reviews', 'service', serviceId, filters],
    queryFn: () => reviewsService.getServiceReviews(serviceId, filters),
    enabled: !!serviceId,
    staleTime: queryConfig.staleTime,
    gcTime: queryConfig.gcTime,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to get user's reviews
 */
export function useUserReviews() {
  return useQuery({
    queryKey: ['reviews', 'user'],
    queryFn: () => reviewsService.getUserReviews(),
    staleTime: queryConfig.staleTime,
    gcTime: queryConfig.gcTime,
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
      // Get profileId from response data
      const profileId = data.providerBranchId;

      // Invalidate relevant queries
      if (profileId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'service', profileId] });
        queryClient.invalidateQueries({ queryKey: ['service', profileId] });
      }
      queryClient.invalidateQueries({ queryKey: ['reviews', 'user'] });
      // Invalidate visits query to update review status
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}

/**
 * Hook to report a review
 */
export function useReportReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason: string }) =>
      reviewsService.reportReview(reviewId, reason),
    onSuccess: () => {
      // Invalidate reviews queries to refresh reportedByCurrentUser status
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
