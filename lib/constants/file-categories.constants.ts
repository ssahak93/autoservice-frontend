/**
 * File category constants
 *
 * These constants define the folder/bucket names used for organizing uploaded files.
 * All file categories should be defined here to ensure consistency across the application.
 *
 * IMPORTANT: These must match the backend constants in backend/src/files/constants/file-categories.constants.ts
 */

export const FILE_CATEGORIES = {
  /**
   * User avatars (plural - used for all user avatars)
   */
  AVATARS: 'avatars',

  /**
   * Provider avatars (plural - used for all provider avatars)
   */
  PROVIDER_AVATARS: 'provider-avatars',

  /**
   * Profile photos for provider branches
   */
  PROFILE_PHOTOS: 'profile-photos',

  /**
   * Work photos for provider branches
   */
  WORK_PHOTOS: 'work-photos',

  /**
   * Chat images
   */
  CHAT_IMAGES: 'chat-images',

  /**
   * Documents
   */
  DOCUMENTS: 'documents',

  /**
   * General files (default category)
   */
  GENERAL: 'general',
} as const;

/**
 * Type for file category values
 */
export type FileCategory = (typeof FILE_CATEGORIES)[keyof typeof FILE_CATEGORIES];
