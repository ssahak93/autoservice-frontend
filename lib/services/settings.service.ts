import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface UserSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  showPhoneNumber: boolean;
  showEmail: boolean;
  profileVisibility: 'public' | 'private' | 'friends';
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsData {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  showPhoneNumber?: boolean;
  showEmail?: boolean;
  profileVisibility?: 'public' | 'private' | 'friends';
  twoFactorEnabled?: boolean;
}

export const settingsService = {
  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    const response = await apiClient.get<UserSettings>(API_ENDPOINTS.AUTH.SETTINGS);
    return response.data;
  },

  /**
   * Update user settings
   */
  async updateSettings(data: UpdateSettingsData): Promise<UserSettings> {
    const response = await apiClient.put<UserSettings>(API_ENDPOINTS.AUTH.SETTINGS, data);
    return response.data;
  },

  /**
   * Update a single setting
   */
  async updateSetting(
    category: 'notifications' | 'privacy' | 'security',
    key: string,
    value: boolean | string
  ): Promise<UserSettings> {
    // Map frontend category/key to backend field
    const fieldMap: Record<string, keyof UpdateSettingsData> = {
      'notifications.email': 'emailNotifications',
      'notifications.push': 'pushNotifications',
      'notifications.sms': 'smsNotifications',
      'privacy.showPhone': 'showPhoneNumber',
      'privacy.showEmail': 'showEmail',
      'privacy.profileVisibility': 'profileVisibility',
      'security.twoFactor': 'twoFactorEnabled',
    };

    const field = fieldMap[`${category}.${key}`];
    if (!field) {
      throw new Error(`Setting ${category}.${key} not found`);
    }

    return this.updateSettings({ [field]: value } as UpdateSettingsData);
  },
};
