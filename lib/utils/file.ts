/**
 * File and image URL utilities
 *
 * Provides consistent file/avatar URL extraction across the application.
 * All file URL extraction should use these utilities to avoid code duplication.
 */

/**
 * Get avatar URL from user or auto service object
 * Handles both avatarFile.fileUrl and avatarUrl (for backward compatibility)
 * @param entity - User or AutoService object with avatarFile or avatarUrl
 * @returns Avatar URL or null if not available
 */
export function getAvatarUrl(
  entity?: {
    avatarFile?: { fileUrl: string } | null;
    avatarUrl?: string | null;
  } | null
): string | null {
  if (!entity) return null;

  // Priority 1: avatarFile.fileUrl (new format)
  if (entity.avatarFile?.fileUrl) {
    return entity.avatarFile.fileUrl;
  }

  // Priority 2: avatarUrl (backward compatibility)
  if (entity.avatarUrl) {
    return entity.avatarUrl;
  }

  return null;
}

/**
 * Get file URL from file object
 * Handles both file.fileUrl and file.url (for backward compatibility)
 * @param file - File object with fileUrl or url
 * @returns File URL or null if not available
 */
export function getFileUrl(
  file?: {
    fileUrl?: string;
    url?: string;
  } | null
): string | null {
  if (!file) return null;

  // Priority 1: fileUrl (new format)
  if (file.fileUrl) {
    return file.fileUrl;
  }

  // Priority 2: url (backward compatibility)
  if (file.url) {
    return file.url;
  }

  return null;
}

/**
 * Get image URL from service/entity with fallback
 * @param entity - Entity with avatarFile or avatarUrl
 * @param fallback - Fallback URL if no avatar is available
 * @returns Image URL (never null)
 */
export function getImageUrl(
  entity?: {
    avatarFile?: { fileUrl: string } | null;
    avatarUrl?: string | null;
  } | null,
  fallback?: string | null
): string {
  const url = getAvatarUrl(entity);
  return url || fallback || '';
}
