/**
 * Phone number validation utilities
 *
 * Format requirements:
 * - Armenian format: 098222680 (9 digits with leading 0)
 * - International format: 98222680 (8 digits without leading 0)
 * - Full format with prefix: +37498222680 or +374098222680
 */

/**
 * Validates Armenian phone number format
 * @param phoneNumber - Phone number without +374 prefix
 * @returns true if valid, false otherwise
 */
export function isValidArmenianPhone(phoneNumber: string): boolean {
  if (!phoneNumber) return false;

  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/[^\d]/g, '');

  // Must be 8 or 9 digits
  // 8 digits: international format (98222680)
  // 9 digits: Armenian format with leading 0 (098222680)
  if (cleaned.length !== 8 && cleaned.length !== 9) {
    return false;
  }

  // If 9 digits, must start with 0
  if (cleaned.length === 9 && !cleaned.startsWith('0')) {
    return false;
  }

  // If 8 digits, must not start with 0
  if (cleaned.length === 8 && cleaned.startsWith('0')) {
    return false;
  }

  return true;
}

/**
 * Formats phone number for backend (adds +374 prefix)
 * @param phoneNumber - Phone number without +374 prefix
 * @returns Formatted phone number with +374 prefix
 */
export function formatPhoneForBackend(phoneNumber: string): string {
  if (!phoneNumber) return '';

  const cleaned = phoneNumber.replace(/[^\d]/g, '');

  if (!cleaned) return '';

  // Remove leading 0 if present (Armenian format)
  const normalized = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;

  return `+374${normalized}`;
}

/**
 * Parses phone number from backend (removes +374 prefix)
 * @param phoneNumber - Phone number with +374 prefix
 * @returns Phone number without +374 prefix
 */
export function parsePhoneFromBackend(phoneNumber: string | null | undefined): string {
  if (!phoneNumber) return '';

  // Remove +374 prefix
  const cleaned = phoneNumber.replace(/^\+374/, '').replace(/[^\d]/g, '');

  return cleaned;
}

/**
 * Phone number validation regex
 * Matches: 8 digits (international) or 9 digits starting with 0 (Armenian)
 */
export const PHONE_PATTERN = /^(0\d{8}|\d{8})$/;

/**
 * Phone number validation error message
 */
export const PHONE_ERROR_MESSAGE =
  'Phone number must be 8 digits (e.g., 98222680) or 9 digits starting with 0 (e.g., 098222680)';
