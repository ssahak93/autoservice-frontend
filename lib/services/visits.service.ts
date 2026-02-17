import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  unwrapResponseData,
  unwrapArrayResponse,
  unwrapPaginatedResponse,
  extractErrorMessage,
  isErrorStatus,
} from '@/lib/utils/api-response';
import type { CreateVisitRequest, PaginatedResponse, Visit } from '@/types';

export const visitsService = {
  async create(data: CreateVisitRequest): Promise<Visit> {
    try {
      const response = await apiClient.post<{ success: boolean; data: Visit } | Visit>(
        API_ENDPOINTS.VISITS.CREATE,
        data
      );
      return unwrapResponseData(response);
    } catch (error) {
      if (isErrorStatus(error, 400)) {
        throw new Error(extractErrorMessage(error, 'Cannot book visit to your own service'));
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

    // Backend may return array directly or PaginatedResponse
    return unwrapPaginatedResponse(response);
  },

  async getById(id: string): Promise<Visit> {
    const response = await apiClient.get<{ success: boolean; data: Visit } | Visit>(
      API_ENDPOINTS.VISITS.DETAIL(id)
    );
    const visit = unwrapResponseData(response);
    if (!visit || (typeof visit === 'object' && !('id' in visit))) {
      throw new Error('Visit not found');
    }
    return visit;
  },

  async updateStatus(id: string, status: Visit['status'], providerId?: string): Promise<Visit> {
    const response = await apiClient.put<{ success: boolean; data: Visit }>(
      API_ENDPOINTS.VISITS.UPDATE_STATUS(id),
      { status },
      {
        params: providerId ? { providerId } : undefined,
      }
    );
    return unwrapResponseData(response);
  },

  async update(id: string, data: Partial<CreateVisitRequest>): Promise<Visit> {
    const response = await apiClient.put<{ success: boolean; data: Visit } | Visit>(
      API_ENDPOINTS.VISITS.UPDATE(id),
      data
    );
    return unwrapResponseData(response);
  },

  async cancel(id: string, reason: string): Promise<Visit> {
    if (!reason || reason.trim().length < 3) {
      throw new Error('Cancellation reason is required and must be at least 3 characters');
    }
    const response = await apiClient.put<{ success: boolean; data: Visit } | Visit>(
      API_ENDPOINTS.VISITS.CANCEL(id),
      { reason: reason.trim() }
    );
    return unwrapResponseData(response);
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.VISITS.DELETE(id)
    );
    return unwrapResponseData(response);
  },

  // Provider methods
  async getProviderList(params?: {
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
    providerId?: string;
  }): Promise<PaginatedResponse<Visit>> {
    const response = await apiClient.get<
      PaginatedResponse<Visit> | { success: boolean; data: PaginatedResponse<Visit> } | Visit[]
    >(API_ENDPOINTS.VISITS.PROVIDER_LIST, {
      params: params ? { ...params, providerId: params.providerId } : undefined,
    });
    return unwrapPaginatedResponse(response);
  },

  async getProviderStatistics(params?: {
    startDate?: string;
    endDate?: string;
    providerId?: string;
  }): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    today: number;
  }> {
    const response = await apiClient.get<
      | {
          total: number;
          pending: number;
          confirmed: number;
          completed: number;
          cancelled: number;
          today: number;
        }
      | {
          success: boolean;
          data: {
            total: number;
            pending: number;
            confirmed: number;
            completed: number;
            cancelled: number;
            today: number;
          };
        }
    >(API_ENDPOINTS.VISITS.PROVIDER_STATISTICS, {
      params,
    });
    return unwrapResponseData(response);
  },

  // Auto service visit actions
  async acceptVisit(
    id: string,
    data?: {
      confirmedDate?: string;
      confirmedTime?: string;
      notes?: string;
    },
    providerId?: string
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
          params: providerId ? { providerId } : undefined,
        }
      );
      return unwrapResponseData(response);
    } catch (error) {
      if (isErrorStatus(error, 400)) {
        throw new Error(extractErrorMessage(error, 'Failed to accept visit'));
      }
      throw error;
    }
  },

  async completeVisit(id: string, notes?: string, providerId?: string): Promise<Visit> {
    const response = await apiClient.put<{ success: boolean; data: Visit } | Visit>(
      API_ENDPOINTS.VISITS.COMPLETE(id),
      notes ? { notes } : {},
      {
        params: providerId ? { providerId } : undefined,
      }
    );
    return unwrapResponseData(response);
  },

  async rescheduleVisit(
    id: string,
    data: {
      scheduledDate: string;
      scheduledTime: string;
    },
    providerId?: string
  ): Promise<Visit> {
    try {
      const response = await apiClient.put<{ success: boolean; data: Visit } | Visit>(
        API_ENDPOINTS.VISITS.RESCHEDULE(id),
        data,
        {
          params: providerId ? { providerId } : undefined,
        }
      );
      return unwrapResponseData(response);
    } catch (error) {
      if (isErrorStatus(error, 400)) {
        throw new Error(extractErrorMessage(error, 'Failed to reschedule visit'));
      }
      throw error;
    }
  },

  async getHistory(id: string): Promise<VisitHistoryEntry[]> {
    const response = await apiClient.get<
      VisitHistoryEntry[] | { success: boolean; data: VisitHistoryEntry[] }
    >(API_ENDPOINTS.VISITS.HISTORY(id));
    return unwrapArrayResponse(response);
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
