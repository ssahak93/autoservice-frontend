import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { CreateVisitRequest, PaginatedResponse, Visit } from '@/types';

export const visitsService = {
  async create(data: CreateVisitRequest): Promise<Visit> {
    const response = await apiClient.post<{ success: boolean; data: Visit }>(
      API_ENDPOINTS.VISITS.CREATE,
      data
    );
    return response.data.data;
  },

  async getList(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Visit>> {
    const response = await apiClient.get<PaginatedResponse<Visit>>(API_ENDPOINTS.VISITS.LIST, {
      params,
    });
    return response.data;
  },

  async getById(id: string): Promise<Visit> {
    const response = await apiClient.get<{ success: boolean; data: Visit }>(
      API_ENDPOINTS.VISITS.DETAIL(id)
    );
    return response.data.data;
  },

  async updateStatus(id: string, status: Visit['status']): Promise<Visit> {
    const response = await apiClient.put<{ success: boolean; data: Visit }>(
      API_ENDPOINTS.VISITS.UPDATE_STATUS(id),
      { status }
    );
    return response.data.data;
  },
};
