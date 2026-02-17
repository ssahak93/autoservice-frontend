import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapResponseData } from '@/lib/utils/api-response';

export interface PhotoItem {
  id: string;
  url: string;
}

export interface ProviderBranch {
  id: string;
  providerId: string;
  description: string;
  specialization?: string;
  yearsOfExperience?: number;
  address: string;
  addressHy?: string;
  addressRu?: string;
  // Location fields (IDs for relations)
  regionId?: string;
  communityId?: string;
  // Display fields (localized names from relations)
  region?: string;
  community?: string;
  communityType?: 'city' | 'village' | 'district';
  latitude: number;
  longitude: number;
  phoneNumber: string;
  workingHours: Record<string, unknown>;
  maxVisitsPerDay: number;
  profilePhotoFileIds?: PhotoItem[] | string[];
  workPhotoFileIds?: PhotoItem[] | string[];
  averageRating?: number;
  totalReviews: number;
  profileCompleteness: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: string;
    serviceType: 'individual' | 'company';
    companyName?: string;
    firstName?: string;
    lastName?: string;
    isApproved?: boolean; // Approval status from Provider (primary table)
    approvedAt?: string | null;
    rejectionReason?: string | null; // Reason for rejection (filled by admin)
    avatarFile?: {
      id: string;
      fileUrl: string;
    };
  };
  services?: Array<{
    id: string;
    serviceType: {
      id: string;
      name: string;
      nameHy?: string;
      nameRu?: string;
    };
  }>;
}

export interface CreateBranchRequest {
  description: string;
  specialization?: string;
  yearsOfExperience?: number;
  address: string;
  addressHy?: string;
  addressRu?: string;
  regionId: string;
  communityId: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  workingHours: Record<string, unknown>;
  maxVisitsPerDay?: number;
  serviceTypes: string[];
  profilePhotoFileIds?: string[];
  workPhotoFileIds?: string[];
}

export interface UpdateBranchRequest extends Partial<CreateBranchRequest> {}

export const providerBranchService = {
  async getBranch(providerId?: string): Promise<ProviderBranch> {
    const response = await apiClient.get<
      ProviderBranch | { success: boolean; data: ProviderBranch }
    >(API_ENDPOINTS.PROVIDERS.BRANCH, {
      params: providerId ? { providerId } : undefined,
    });
    return unwrapResponseData(response);
  },

  async createBranch(data: CreateBranchRequest, providerId?: string): Promise<ProviderBranch> {
    const response = await apiClient.post<
      ProviderBranch | { success: boolean; data: ProviderBranch }
    >(API_ENDPOINTS.PROVIDERS.CREATE_BRANCH, data, {
      params: providerId ? { providerId } : undefined,
    });
    return unwrapResponseData(response);
  },

  async updateBranch(data: UpdateBranchRequest, providerId?: string): Promise<ProviderBranch> {
    const response = await apiClient.put<
      ProviderBranch | { success: boolean; data: ProviderBranch }
    >(API_ENDPOINTS.PROVIDERS.UPDATE_BRANCH, data, {
      params: providerId ? { providerId } : undefined,
    });
    return unwrapResponseData(response);
  },

  async publishBranch(isPublished: boolean, providerId?: string): Promise<ProviderBranch> {
    const response = await apiClient.put<
      ProviderBranch | { success: boolean; data: ProviderBranch }
    >(
      API_ENDPOINTS.PROVIDERS.PUBLISH_BRANCH,
      { isPublished },
      {
        params: providerId ? { providerId } : undefined,
      }
    );
    return unwrapResponseData(response);
  },

  async uploadPhoto(
    file: File,
    type: 'profile' | 'work'
  ): Promise<{ id: string; fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await apiClient.post<
      { id: string; fileUrl: string } | { success: boolean; data: { id: string; fileUrl: string } }
    >(API_ENDPOINTS.PROVIDERS.UPLOAD_PHOTO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return unwrapResponseData(response);
  },

  async deletePhoto(
    fileId: string,
    type: 'profile' | 'work',
    providerId?: string
  ): Promise<ProviderBranch> {
    // Use request method for DELETE with body
    const response = await apiClient.post<
      ProviderBranch | { success: boolean; data: ProviderBranch }
    >(
      API_ENDPOINTS.PROVIDERS.DELETE_PHOTO,
      { fileId, type },
      {
        params: providerId ? { providerId } : undefined,
      }
    );
    return unwrapResponseData(response);
  },

  async reorderPhotos(
    fileIds: string[],
    type: 'profile' | 'work',
    providerId?: string
  ): Promise<ProviderBranch> {
    const response = await apiClient.put<
      ProviderBranch | { success: boolean; data: ProviderBranch }
    >(
      API_ENDPOINTS.PROVIDERS.REORDER_PHOTOS,
      { fileIds, type },
      {
        params: providerId ? { providerId } : undefined,
      }
    );
    return unwrapResponseData(response);
  },

  async updateServiceInfo(
    providerId: string,
    data: {
      companyName?: string;
      firstName?: string;
      lastName?: string;
      avatarFileId?: string;
    }
  ): Promise<ProviderBranch> {
    const response = await apiClient.put<
      ProviderBranch | { success: boolean; data: ProviderBranch }
    >(API_ENDPOINTS.PROVIDERS.UPDATE(providerId), data);
    return unwrapResponseData(response);
  },
};
