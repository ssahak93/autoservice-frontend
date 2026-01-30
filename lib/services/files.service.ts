import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
}

export interface UploadFileResponse {
  id: string;
  originalName: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
}

class FilesService {
  /**
   * Upload a single file
   */
  async uploadFile(file: File, category?: string): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (category) {
      formData.append('category', category);
    }

    const response = await apiClient.post<UploadFileResponse>(
      API_ENDPOINTS.FILES.UPLOAD,
      formData,
      {
        // Don't set Content-Type - let browser set it with boundary
        // The interceptor will handle removing any Content-Type header
      }
    );

    return response.data;
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[], category?: string): Promise<UploadFileResponse[]> {
    if (files.length === 0) {
      return [];
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (category) {
      formData.append('category', category);
    }

    const response = await apiClient.post<UploadFileResponse[]>(
      API_ENDPOINTS.FILES.UPLOAD_MULTIPLE,
      formData,
      {
        // Don't set Content-Type - let browser set it with boundary
        // The interceptor will handle removing any Content-Type header
      }
    );

    return response.data;
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.FILES.DELETE(fileId));
  }

  /**
   * Get file by ID
   */
  async getFileById(id: string): Promise<UploadFileResponse> {
    const response = await apiClient.get<UploadFileResponse>(API_ENDPOINTS.FILES.GET(id));
    return response.data;
  }

  /**
   * Get multiple files by IDs
   */
  async getFilesByIds(ids: string[]): Promise<UploadFileResponse[]> {
    if (ids.length === 0) return [];
    // Fetch files in parallel
    const files = await Promise.all(ids.map((id) => this.getFileById(id).catch(() => null)));
    return files.filter((file): file is UploadFileResponse => file !== null);
  }
}

export const filesService = new FilesService();
