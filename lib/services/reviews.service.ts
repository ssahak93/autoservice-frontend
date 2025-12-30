import { apiClient } from '@/lib/api/client';
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
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);

    const response = await apiClient.get<PaginatedResponse<Review>>(
      `/reviews/auto-service/${serviceId}${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  /**
   * Get user's reviews
   */
  async getUserReviews(): Promise<Review[]> {
    const response = await apiClient.get<Review[]>('/reviews/user');
    return response.data;
  },

  /**
   * Create a review for a completed visit
   */
  async createReview(dto: CreateReviewDto): Promise<Review> {
    const response = await apiClient.post<Review>('/reviews', dto);
    return response.data;
  },

  /**
   * Report a review
   */
  async reportReview(reviewId: string, reason: string): Promise<void> {
    await apiClient.post(`/reviews/${reviewId}/report`, { reason });
  },
};

