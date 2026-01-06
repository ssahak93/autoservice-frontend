/**
 * Password validation utilities
 *
 * IMPORTANT: These constants MUST match the backend constants in:
 * backend/src/common/utils/password.util.ts
 *
 * This ensures consistent password validation rules across backend and frontend.
 */

/**
 * Minimum password length
 * Must match PASSWORD_MIN_LENGTH in backend
 */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Password validation regex pattern
 * Must match PASSWORD_PATTERN in backend
 *
 * Requirements:
 * - At least one lowercase letter (a-z)
 * - At least one uppercase letter (A-Z)
 * - At least one digit (0-9)
 * - At least one special character (@$!%*?&#)
 * - Only allowed characters: letters, digits, and special characters (@$!%*?&#)
 * - Minimum length is enforced separately using PASSWORD_MIN_LENGTH
 */
export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/;

/**
 * Password validation error message
 * Must match PASSWORD_ERROR_MESSAGE in backend
 */
export const PASSWORD_ERROR_MESSAGE =
  'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)';

/**
 * Validates password according to the rules
 * @param password - Password to validate
 * @returns true if password is valid, false otherwise
 */
export function isValidPassword(password: string): boolean {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return false;
  }
  return PASSWORD_PATTERN.test(password);
}
