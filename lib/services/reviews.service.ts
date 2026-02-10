import { apiClient } from '@/lib/api/client';
import {
  unwrapResponseData,
  unwrapArrayResponse,
  unwrapPaginatedResponse,
} from '@/lib/utils/api-response';
import { buildQueryParams } from '@/lib/utils/params';
import type { PaginatedResponse, Review } from '@/types';

export interface CreateReviewDto {
  visitId: string;
  rating: number;
  comment?: string;
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
}

export const reviewsService = {
  /**
   * Get reviews for a specific auto service
   */
  async getServiceReviews(
    serviceId: string,
    filters?: ReviewFilters
  ): Promise<PaginatedResponse<Review>> {
    const queryParams = buildQueryParams(filters || {}, false);

    const response = await apiClient.get<
      PaginatedResponse<Review> | { success: boolean; data: PaginatedResponse<Review> } | Review[]
    >(`/reviews/auto-service/${serviceId}`, {
      params: queryParams,
    });
    return unwrapPaginatedResponse(response);
  },

  /**
   * Get user's reviews
   */
  async getUserReviews(): Promise<Review[]> {
    const response = await apiClient.get<Review[] | { success: boolean; data: Review[] }>(
      '/reviews/user'
    );
    return unwrapArrayResponse(response);
  },

  /**
   * Create a review for a completed visit
   */
  async createReview(dto: CreateReviewDto): Promise<Review> {
    const response = await apiClient.post<Review | { success: boolean; data: Review }>(
      '/reviews',
      dto
    );
    return unwrapResponseData(response);
  },

  /**
   * Report a review
   */
  async reportReview(reviewId: string, reason: string): Promise<void> {
    await apiClient.post(`/reviews/${reviewId}/report`, { reason });
  },
};
