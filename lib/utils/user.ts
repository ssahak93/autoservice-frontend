/**
 * User name formatting utilities
 *
 * Provides consistent user name formatting across the application.
 * All user name formatting should use these utilities to avoid code duplication.
 */

/**
 * Format user full name from firstName and lastName
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @param fallback - Fallback text if both names are empty (default: 'User')
 * @returns Formatted full name or fallback
 */
export function formatUserName(
  firstName?: string | null,
  lastName?: string | null,
  fallback: string = 'User'
): string {
  if (firstName || lastName) {
    return `${firstName || ''} ${lastName || ''}`.trim();
  }
  return fallback;
}

/**
 * Format auto service name (company name or individual name)
 * @param companyName - Company name (if available)
 * @param firstName - Owner's first name
 * @param lastName - Owner's last name
 * @param fallback - Fallback text if all are empty (default: 'Auto Service')
 * @returns Formatted service name or fallback
 */
export function formatServiceName(
  companyName?: string | null,
  firstName?: string | null,
  lastName?: string | null,
  fallback: string = 'Auto Service'
): string {
  if (companyName) {
    return companyName;
  }
  if (firstName || lastName) {
    return `${firstName || ''} ${lastName || ''}`.trim();
  }
  return fallback;
}

/**
 * Format customer name for display
 * @param firstName - Customer's first name
 * @param lastName - Customer's last name
 * @param fallback - Fallback text (default: 'Customer')
 * @returns Formatted customer name or fallback
 */
export function formatCustomerName(
  firstName?: string | null,
  lastName?: string | null,
  fallback: string = 'Customer'
): string {
  return formatUserName(firstName, lastName, fallback);
}

/**
 * Get user initials for avatar display
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @param email - User's email (used as fallback)
 * @returns User initials (e.g., "JD" for John Doe)
 */
export function getUserInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null
): string {
  if (firstName || lastName) {
    const first = firstName?.charAt(0).toUpperCase() || '';
    const last = lastName?.charAt(0).toUpperCase() || '';
    return `${first}${last}` || first || last;
  }
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  return 'U';
}
