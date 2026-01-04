import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { CreateVisitRequest, PaginatedResponse, Visit } from '@/types';

export const visitsService = {
  async create(data: CreateVisitRequest): Promise<Visit> {
    try {
      const response = await apiClient.post<{ success: boolean; data: Visit } | Visit>(
        API_ENDPOINTS.VISITS.CREATE,
        data
      );
      // Backend may return data directly or wrapped in {success, data}
      if ('success' in response.data && response.data.success && 'data' in response.data) {
        return response.data.data;
      }
      return response.data as Visit;
    } catch (error) {
      // Extract error message from backend response
      const axiosError = error as {
        response?: {
          data?: { error?: { message?: string }; message?: string };
          status?: number;
        };
      };

      if (axiosError.response?.status === 400) {
        const errorMessage =
          axiosError.response.data?.error?.message ||
          axiosError.response.data?.message ||
          'Cannot book visit to your own service';
        throw new Error(errorMessage);
      }

      throw error;
    }
  },

  async getList(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Visit>> {
    const response = await apiClient.get<Visit[] | PaginatedResponse<Visit>>(
      API_ENDPOINTS.VISITS.LIST,
      {
        params,
      }
    );

    // Backend returns array directly, wrap it in PaginatedResponse format
    if (Array.isArray(response.data)) {
      const visits = response.data;
      return {
        success: true,
        data: visits,
        pagination: {
          page: 1,
          limit: visits.length,
          total: visits.length,
          totalPages: 1,
        },
      };
    }

    // If already in PaginatedResponse format, return as is
    return response.data as PaginatedResponse<Visit>;
  },

  async getById(id: string): Promise<Visit> {
    const response = await apiClient.get<{ success: boolean; data: Visit }>(
      API_ENDPOINTS.VISITS.DETAIL(id)
    );
    if (!response.data?.data) {
      throw new Error('Visit not found');
    }
    return response.data.data;
  },

  async updateStatus(id: string, status: Visit['status']): Promise<Visit> {
    const response = await apiClient.put<{ success: boolean; data: Visit }>(
      API_ENDPOINTS.VISITS.UPDATE_STATUS(id),
      { status }
    );
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateVisitRequest>): Promise<Visit> {
    const response = await apiClient.put<{ success: boolean; data: Visit } | Visit>(
      API_ENDPOINTS.VISITS.UPDATE(id),
      data
    );
    if ('success' in response.data && response.data.success && 'data' in response.data) {
      return response.data.data;
    }
    return response.data as Visit;
  },

  async cancel(id: string, reason?: string): Promise<Visit> {
    const response = await apiClient.put<{ success: boolean; data: Visit } | Visit>(
      API_ENDPOINTS.VISITS.CANCEL(id),
      { reason }
    );
    if ('success' in response.data && response.data.success && 'data' in response.data) {
      return response.data.data;
    }
    return response.data as Visit;
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.VISITS.DELETE(id)
    );
    return response.data;
  },
};
