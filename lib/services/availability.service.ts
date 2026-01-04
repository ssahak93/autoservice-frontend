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
};
