import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapResponseData } from '@/lib/utils/api-response';

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
  newVisitNotification: boolean;
  visitReminderNotification: boolean;
  messageNotification: boolean;
  teamInviteNotification: boolean;
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
  newVisitNotification?: boolean;
  visitReminderNotification?: boolean;
  messageNotification?: boolean;
  teamInviteNotification?: boolean;
}

export const settingsService = {
  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    const response = await apiClient.get<UserSettings | { success: boolean; data: UserSettings }>(
      API_ENDPOINTS.AUTH.SETTINGS
    );
    return unwrapResponseData(response);
  },

  /**
   * Update user settings
   */
  async updateSettings(data: UpdateSettingsData): Promise<UserSettings> {
    const response = await apiClient.put<UserSettings | { success: boolean; data: UserSettings }>(
      API_ENDPOINTS.AUTH.SETTINGS,
      data
    );
    return unwrapResponseData(response);
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
      'notifications.newVisit': 'newVisitNotification',
      'notifications.reminder': 'visitReminderNotification',
      'notifications.message': 'messageNotification',
      'notifications.teamInvite': 'teamInviteNotification',
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

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.DELETE_ACCOUNT
    );
    return unwrapResponseData(response);
  },
};
