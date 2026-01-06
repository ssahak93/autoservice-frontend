import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { AutoServiceOption } from '@/stores/autoServiceStore';

export const autoServicesService = {
  /**
   * Get list of available auto services (owned or team member)
   */
  async getAvailableAutoServices(): Promise<AutoServiceOption[]> {
    const response = await apiClient.get<{ data: AutoServiceOption[] }>(
      API_ENDPOINTS.AUTO_SERVICES.AVAILABLE
    );
    return response.data.data;
  },
};
