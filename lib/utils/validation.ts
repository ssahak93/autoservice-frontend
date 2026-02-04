/**
 * Common Zod validation schemas and helpers
 *
 * Provides reusable validation patterns to avoid code duplication.
 * All form validation should use these utilities when possible.
 */

import { z } from 'zod';

import { PASSWORD_ERROR_MESSAGE, PASSWORD_MIN_LENGTH, PASSWORD_PATTERN } from './password.util';
import { PHONE_ERROR_MESSAGE, PHONE_PATTERN } from './phone.util';

/**
 * Common validation schemas that can be reused across forms
 */
export const commonValidations = {
  /**
   * Email validation schema
   */
  email: (requiredMessage?: string, invalidMessage?: string) =>
    z
      .string()
      .min(1, requiredMessage || 'Email is required')
      .email(invalidMessage || 'Invalid email address'),

  /**
   * Password validation schema
   */
  password: (minLengthMessage?: string, patternMessage?: string) =>
    z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        minLengthMessage || `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
      )
      .regex(PASSWORD_PATTERN, patternMessage || PASSWORD_ERROR_MESSAGE),

  /**
   * Phone number validation schema (optional)
   */
  phoneOptional: (invalidMessage?: string) =>
    z
      .string()
      .optional()
      .refine((val) => !val || PHONE_PATTERN.test(val), invalidMessage || PHONE_ERROR_MESSAGE),

  /**
   * Phone number validation schema (required)
   */
  phoneRequired: (requiredMessage?: string, invalidMessage?: string) =>
    z
      .string()
      .min(1, requiredMessage || 'Phone number is required')
      .regex(PHONE_PATTERN, invalidMessage || PHONE_ERROR_MESSAGE),

  /**
   * First name validation schema
   */
  firstName: (requiredMessage?: string) =>
    z.string().min(1, requiredMessage || 'First name is required'),

  /**
   * Last name validation schema
   */
  lastName: (requiredMessage?: string) =>
    z.string().min(1, requiredMessage || 'Last name is required'),

  /**
   * Rating validation schema (1-5)
   */
  rating: (requiredMessage?: string) =>
    z
      .number()
      .min(1, requiredMessage || 'Rating is required')
      .max(5, 'Rating must be between 1 and 5'),

  /**
   * Required string validation
   */
  requiredString: (message: string) => z.string().min(1, message),

  /**
   * Required number validation
   */
  requiredNumber: (message: string) => z.number({ required_error: message }),
};

/**
 * Helper to create a password confirmation refinement
 */
export function createPasswordConfirmationRefinement(
  passwordField: string = 'password',
  confirmPasswordField: string = 'confirmPassword',
  errorMessage: string = "Passwords don't match"
) {
  return (schema: z.ZodObject<z.ZodRawShape>) =>
    schema.refine((data) => data[passwordField] === data[confirmPasswordField], {
      message: errorMessage,
      path: [confirmPasswordField],
    });
}
