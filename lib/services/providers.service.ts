import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapResponseData, unwrapArrayResponse } from '@/lib/utils/api-response';

// Maximum number of providers a user can own (should match backend constant)
export const MAX_PROVIDERS_PER_USER = 5;

export interface CreateProviderRequest {
  serviceType: 'individual' | 'company';
  companyName?: string;
  firstName?: string;
  lastName?: string;
  avatarFileId?: string;
}

export interface UpdateProviderRequest {
  companyName?: string;
  firstName?: string;
  lastName?: string;
  avatarFileId?: string;
}

export interface Provider {
  id: string;
  serviceType: 'individual' | 'company';
  companyName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  isApproved?: boolean; // Approval status from branch
  avatarFile?: {
    id: string;
    fileUrl: string;
  };
}

export const providersService = {
  async createProvider(data: CreateProviderRequest): Promise<Provider> {
    const response = await apiClient.post<Provider | { success: boolean; data: Provider }>(
      API_ENDPOINTS.PROVIDERS.CREATE,
      data
    );
    return unwrapResponseData(response);
  },

  async getAvailableProviders(): Promise<
    Array<{
      id: string;
      name: string;
      role: string;
      serviceType: 'individual' | 'company';
      companyName: string | null;
      firstName: string | null;
      lastName: string | null;
      avatarFile: { id: string; fileUrl: string } | null;
      hasBranch: boolean;
      isApproved?: boolean; // Approval status from branch
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
            hasBranch: boolean;
            isApproved?: boolean; // Approval status from branch
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
          hasBranch: boolean;
          isApproved?: boolean; // Approval status from branch
          rejectionReason?: string | null;
          isBlocked?: boolean;
          blockedReason?: string | null;
        }>
    >(API_ENDPOINTS.PROVIDERS.AVAILABLE);

    return unwrapArrayResponse(response);
  },

  async updateProvider(providerId: string, data: UpdateProviderRequest): Promise<Provider> {
    const response = await apiClient.put<Provider | { success: boolean; data: Provider }>(
      API_ENDPOINTS.PROVIDERS.UPDATE(providerId),
      data
    );
    return unwrapResponseData(response);
  },

  async deleteProvider(providerId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.PROVIDERS.DELETE(providerId)
    );
    return unwrapResponseData(response);
  },
};
