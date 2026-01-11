import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

// Maximum number of auto services a user can own (should match backend constant)
export const MAX_AUTO_SERVICES_PER_USER = 5;

export interface CreateAutoServiceRequest {
  serviceType: 'individual' | 'company';
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
  isVerified: boolean;
  avatarFile?: {
    id: string;
    fileUrl: string;
  };
}

export const autoServicesService = {
  async createAutoService(data: CreateAutoServiceRequest): Promise<AutoService> {
    const response = await apiClient.post<AutoService>(API_ENDPOINTS.AUTO_SERVICES.CREATE, data);
    return response.data;
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
      isVerified: boolean;
      avatarFile: { id: string; fileUrl: string } | null;
      hasProfile: boolean;
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
            isVerified: boolean;
            avatarFile: { id: string; fileUrl: string } | null;
            hasProfile: boolean;
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
          isVerified: boolean;
          avatarFile: { id: string; fileUrl: string } | null;
          hasProfile: boolean;
          isApproved?: boolean;
          rejectionReason?: string | null;
        }>
    >(API_ENDPOINTS.AUTO_SERVICES.AVAILABLE);

    // Handle both response formats: { data: [...] } or [...]
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  async deleteAutoService(autoServiceId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTO_SERVICES.DELETE(autoServiceId)
    );
    return response.data;
  },
};
