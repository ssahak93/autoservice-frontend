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
    const response = await apiClient.get<{ success: boolean; data: Visit } | Visit>(
      API_ENDPOINTS.VISITS.DETAIL(id)
    );
    // Backend may return data directly or wrapped in {success, data}
    if ('success' in response.data && response.data.success && 'data' in response.data) {
      return response.data.data;
    }
    if (!response.data || (typeof response.data === 'object' && !('id' in response.data))) {
      throw new Error('Visit not found');
    }
    return response.data as Visit;
  },

  async updateStatus(id: string, status: Visit['status'], autoServiceId?: string): Promise<Visit> {
    const response = await apiClient.put<{ success: boolean; data: Visit }>(
      API_ENDPOINTS.VISITS.UPDATE_STATUS(id),
      { status },
      {
        params: autoServiceId ? { autoServiceId } : undefined,
      }
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

  async cancel(id: string, reason: string): Promise<Visit> {
    if (!reason || reason.trim().length < 3) {
      throw new Error('Cancellation reason is required and must be at least 3 characters');
    }
    const response = await apiClient.put<{ success: boolean; data: Visit } | Visit>(
      API_ENDPOINTS.VISITS.CANCEL(id),
      { reason: reason.trim() }
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

  // Auto service methods
  async getAutoServiceList(params?: {
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
    autoServiceId?: string;
  }): Promise<PaginatedResponse<Visit>> {
    const response = await apiClient.get<PaginatedResponse<Visit>>(
      API_ENDPOINTS.VISITS.AUTO_SERVICE_LIST,
      {
        params,
      }
    );
    return response.data;
  },

  async getAutoServiceStatistics(params?: {
    startDate?: string;
    endDate?: string;
    autoServiceId?: string;
  }): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    today: number;
  }> {
    const response = await apiClient.get<{
      total: number;
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
      today: number;
    }>(API_ENDPOINTS.VISITS.AUTO_SERVICE_STATISTICS, {
      params,
    });
    return response.data;
  },

  // Auto service visit actions
  async acceptVisit(
    id: string,
    data?: {
      confirmedDate?: string;
      confirmedTime?: string;
      notes?: string;
    },
    autoServiceId?: string
  ): Promise<Visit> {
    try {
      const payload: {
        status: string;
        confirmedDate?: string;
        confirmedTime?: string;
        notes?: string;
      } = {
        status: 'confirmed',
      };

      if (data?.confirmedDate) {
        payload.confirmedDate = data.confirmedDate;
      }
      if (data?.confirmedTime) {
        payload.confirmedTime = data.confirmedTime;
      }
      if (data?.notes) {
        payload.notes = data.notes;
      }

      const response = await apiClient.put<{ success: boolean; data: Visit } | Visit>(
        API_ENDPOINTS.VISITS.UPDATE_STATUS(id),
        payload,
        {
          params: autoServiceId ? { autoServiceId } : undefined,
        }
      );
      if ('success' in response.data && response.data.success && 'data' in response.data) {
        return response.data.data;
      }
      return response.data as Visit;
    } catch (error) {
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
          'Failed to accept visit';
        throw new Error(errorMessage);
      }

      throw error;
    }
  },

  async completeVisit(id: string, notes?: string, autoServiceId?: string): Promise<Visit> {
    const response = await apiClient.put<{ success: boolean; data: Visit } | Visit>(
      API_ENDPOINTS.VISITS.COMPLETE(id),
      notes ? { notes } : {},
      {
        params: autoServiceId ? { autoServiceId } : undefined,
      }
    );
    if ('success' in response.data && response.data.success && 'data' in response.data) {
      return response.data.data;
    }
    return response.data as Visit;
  },

  async rescheduleVisit(
    id: string,
    data: {
      scheduledDate: string;
      scheduledTime: string;
    },
    autoServiceId?: string
  ): Promise<Visit> {
    try {
      const response = await apiClient.put<{ success: boolean; data: Visit } | Visit>(
        API_ENDPOINTS.VISITS.RESCHEDULE(id),
        data,
        {
          params: autoServiceId ? { autoServiceId } : undefined,
        }
      );
      if ('success' in response.data && response.data.success && 'data' in response.data) {
        return response.data.data;
      }
      return response.data as Visit;
    } catch (error) {
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
          'Failed to reschedule visit';
        throw new Error(errorMessage);
      }

      throw error;
    }
  },

  async getHistory(id: string): Promise<VisitHistoryEntry[]> {
    const response = await apiClient.get<VisitHistoryEntry[]>(API_ENDPOINTS.VISITS.HISTORY(id));
    return response.data;
  },
};

export interface VisitHistoryEntry {
  id: string;
  visitId: string;
  changedBy: string;
  changedByType: 'user' | 'service' | 'system';
  changeType: string;
  oldValue: string | null;
  newValue: string | null;
  description: string | null;
  createdAt: string;
  visit?: {
    id: string;
    scheduledDate: string;
    scheduledTime: string;
    status: string;
  };
}
