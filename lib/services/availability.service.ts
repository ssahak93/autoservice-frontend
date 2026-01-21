import { apiClient } from '@/lib/api/client';

export interface DateLoad {
  date: string;
  bookedVisits: number;
  maxVisits: number;
  loadPercentage: number;
  status: 'available' | 'heavy' | 'full';
}

export interface WorkingHours {
  [key: string]: { start: string; end: string } | null;
}

export interface AvailabilityException {
  id: string;
  autoServiceProfileId: string;
  date: string;
  isAvailable: boolean;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
  createdAt: string;
}

export interface Exception {
  date: string;
  start?: string;
  end?: string;
  isClosed?: boolean;
}

export interface AvailabilityResponse {
  workingHours: WorkingHours;
  exceptions: Exception[];
  maxVisitsPerDay: number;
  scheduledVisits: Array<{
    date: string;
    time: string;
    visitId: string;
  }>;
  availableSlots: Array<{
    date: string;
    times: string[];
  }>;
  dateLoad: DateLoad[];
}

export const availabilityService = {
  /**
   * Get availability for an auto service
   * @param autoServiceId - Auto service ID
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   */
  async getAvailability(
    autoServiceId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailabilityResponse | null | 'OWN_SERVICE'> {
    try {
      const response = await apiClient.get<AvailabilityResponse>(
        `/auto-services/${autoServiceId}/availability`,
        {
          params: {
            startDate,
            endDate,
          },
        }
      );
      return response.data;
    } catch (error) {
      // Check if this is the "own service" error
      const axiosError = error as {
        response?: {
          status?: number;
          data?: {
            error?: {
              message?: string;
            };
            message?: string;
          };
        };
      };

      // If 400 error with "own service" message, return 'OWN_SERVICE'
      if (axiosError.response?.status === 400) {
        const errorData = axiosError.response.data;
        const errorMessage =
          (errorData as { error?: { message?: string }; message?: string })?.error?.message ||
          (errorData as { message?: string })?.message ||
          '';

        // Check for own service error in any language
        if (
          errorMessage.includes('own service') ||
          errorMessage.includes('собственный сервис') ||
          errorMessage.includes('սեփական սերվիս') ||
          errorMessage.includes('Cannot book visit to your own service') ||
          errorMessage.includes('Вы не можете записаться') ||
          errorMessage.includes('Դուք չեք կարող')
        ) {
          return 'OWN_SERVICE';
        }
      }

      // If profile not found or service not found, return null
      // This allows the datepicker to work without availability data
      if (axiosError.response?.status === 404) {
        return null;
      }

      throw error;
    }
  },

  /**
   * Get availability for own auto service (for service owners)
   */
  async getOwnAvailability(
    startDate: string,
    endDate: string,
    autoServiceId?: string
  ): Promise<AvailabilityResponse> {
    const params: Record<string, string> = { startDate, endDate };
    if (autoServiceId) {
      params.autoServiceId = autoServiceId;
    }
    const response = await apiClient.get<AvailabilityResponse>('/auto-service/availability', {
      params,
    });
    return response.data;
  },

  /**
   * Get all availability exceptions
   */
  async getExceptions(autoServiceId?: string): Promise<AvailabilityException[]> {
    const params = autoServiceId ? { autoServiceId } : {};
    const response = await apiClient.get<AvailabilityException[]>(
      '/auto-service/availability/exceptions',
      { params }
    );
    return response.data;
  },

  /**
   * Create availability exception
   */
  async createException(
    data: {
      date: string;
      isAvailable: boolean;
      startTime?: string;
      endTime?: string;
      reason?: string;
    },
    autoServiceId?: string
  ): Promise<AvailabilityException> {
    const params = autoServiceId ? { autoServiceId } : {};
    const response = await apiClient.post<AvailabilityException>(
      '/auto-service/availability/exceptions',
      data,
      { params }
    );
    return response.data;
  },

  /**
   * Update availability exception
   */
  async updateException(
    exceptionId: string,
    data: {
      isAvailable?: boolean;
      startTime?: string;
      endTime?: string;
      reason?: string;
    },
    autoServiceId?: string
  ): Promise<AvailabilityException> {
    const params = autoServiceId ? { autoServiceId } : {};
    const response = await apiClient.put<AvailabilityException>(
      `/auto-service/availability/exceptions/${exceptionId}`,
      data,
      { params }
    );
    return response.data;
  },

  /**
   * Delete availability exception
   */
  async deleteException(exceptionId: string): Promise<void> {
    await apiClient.delete(`/auto-service/availability/exceptions/${exceptionId}`);
  },
};
