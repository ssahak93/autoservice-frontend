import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapResponseData, unwrapArrayResponse } from '@/lib/utils/api-response';

// Maximum number of auto services a user can own (should match backend constant)
export const MAX_AUTO_SERVICES_PER_USER = 5;

export interface CreateAutoServiceRequest {
  serviceType: 'individual' | 'company';
  companyName?: string;
  firstName?: string;
  lastName?: string;
  avatarFileId?: string;
}

export interface UpdateAutoServiceRequest {
  companyName?: string;
  firstName?: string;
  lastName?: string;
  avatarFileId?: string;
}

export interface AutoService {
  id: string;
  serviceType: 'individual' | 'company';
  companyName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  isApproved?: boolean; // Approval status from profile
  avatarFile?: {
    id: string;
    fileUrl: string;
  };
}

export const autoServicesService = {
  async createAutoService(data: CreateAutoServiceRequest): Promise<AutoService> {
    const response = await apiClient.post<AutoService | { success: boolean; data: AutoService }>(
      API_ENDPOINTS.AUTO_SERVICES.CREATE,
      data
    );
    return unwrapResponseData(response);
  },

  async getAvailableAutoServices(): Promise<
    Array<{
      id: string;
      name: string;
      role: string;
      serviceType: 'individual' | 'company';
      companyName: string | null;
      firstName: string | null;
      lastName: string | null;
      avatarFile: { id: string; fileUrl: string } | null;
      hasProfile: boolean;
      isApproved?: boolean; // Approval status from profile
      isBlocked?: boolean;
      blockedReason?: string | null;
    }>
  > {
    const response = await apiClient.get<
      | {
          data?: Array<{
            id: string;
            name: string;
            role: string;
            serviceType: 'individual' | 'company';
            companyName: string | null;
            firstName: string | null;
            lastName: string | null;
            avatarFile: { id: string; fileUrl: string } | null;
            hasProfile: boolean;
            isApproved?: boolean; // Approval status from profile
          }>;
        }
      | Array<{
          id: string;
          name: string;
          role: string;
          serviceType: 'individual' | 'company';
          companyName: string | null;
          firstName: string | null;
          lastName: string | null;
          avatarFile: { id: string; fileUrl: string } | null;
          hasProfile: boolean;
          isApproved?: boolean; // Approval status from profile
          rejectionReason?: string | null;
          isBlocked?: boolean;
          blockedReason?: string | null;
        }>
    >(API_ENDPOINTS.AUTO_SERVICES.AVAILABLE);

    return unwrapArrayResponse(response);
  },

  async updateAutoService(
    autoServiceId: string,
    data: UpdateAutoServiceRequest
  ): Promise<AutoService> {
    const response = await apiClient.put<AutoService | { success: boolean; data: AutoService }>(
      API_ENDPOINTS.AUTO_SERVICES.UPDATE(autoServiceId),
      data
    );
    return unwrapResponseData(response);
  },

  async deleteAutoService(autoServiceId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTO_SERVICES.DELETE(autoServiceId)
    );
    return unwrapResponseData(response);
  },
};
