import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface PhotoItem {
  id: string;
  url: string;
}

export interface AutoServiceProfile {
  id: string;
  autoServiceId: string;
  description: string;
  specialization?: string;
  yearsOfExperience?: number;
  address: string;
  city: string;
  region: string;
  district?: string;
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
  autoService?: {
    id: string;
    serviceType: 'individual' | 'company';
    companyName?: string;
    firstName?: string;
    lastName?: string;
    isVerified: boolean;
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

export interface CreateProfileRequest {
  description: string;
  specialization?: string;
  yearsOfExperience?: number;
  address: string;
  city: string;
  region: string;
  district?: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  workingHours: Record<string, unknown>;
  maxVisitsPerDay?: number;
  serviceTypes: string[];
  profilePhotoFileIds?: string[];
  workPhotoFileIds?: string[];
}

export interface UpdateProfileRequest extends Partial<CreateProfileRequest> {}

export const autoServiceProfileService = {
  async getProfile(autoServiceId?: string): Promise<AutoServiceProfile> {
    const response = await apiClient.get<AutoServiceProfile>(API_ENDPOINTS.AUTO_SERVICES.PROFILE, {
      params: autoServiceId ? { autoServiceId } : undefined,
    });
    return response.data;
  },

  async createProfile(data: CreateProfileRequest): Promise<AutoServiceProfile> {
    const response = await apiClient.post<AutoServiceProfile>(
      API_ENDPOINTS.AUTO_SERVICES.CREATE_PROFILE,
      data
    );
    return response.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<AutoServiceProfile> {
    const response = await apiClient.put<AutoServiceProfile>(
      API_ENDPOINTS.AUTO_SERVICES.UPDATE_PROFILE,
      data
    );
    return response.data;
  },

  async publishProfile(isPublished: boolean): Promise<AutoServiceProfile> {
    const response = await apiClient.put<AutoServiceProfile>(
      API_ENDPOINTS.AUTO_SERVICES.PUBLISH_PROFILE,
      { isPublished }
    );
    return response.data;
  },

  async uploadPhoto(
    file: File,
    type: 'profile' | 'work'
  ): Promise<{ id: string; fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await apiClient.post<{ id: string; fileUrl: string }>(
      API_ENDPOINTS.AUTO_SERVICES.UPLOAD_PHOTO,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async deletePhoto(fileId: string, type: 'profile' | 'work'): Promise<AutoServiceProfile> {
    // Use request method for DELETE with body
    const response = await apiClient.post<AutoServiceProfile>(
      API_ENDPOINTS.AUTO_SERVICES.DELETE_PHOTO,
      { fileId, type }
    );
    return response.data;
  },

  async reorderPhotos(fileIds: string[], type: 'profile' | 'work'): Promise<AutoServiceProfile> {
    const response = await apiClient.put<AutoServiceProfile>(
      API_ENDPOINTS.AUTO_SERVICES.REORDER_PHOTOS,
      { fileIds, type }
    );
    return response.data;
  },
};
