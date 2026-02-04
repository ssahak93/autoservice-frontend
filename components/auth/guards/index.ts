/**
 * Guards exports
 *
 * Provides reusable guard components for authentication and authorization
 * Following SOLID principles:
 * - Single Responsibility: Each guard handles one concern
 * - Open/Closed: Easy to extend without modification
 * - Dependency Inversion: Guards depend on hooks (abstractions)
 */

export { AuthGuard } from './AuthGuard';
export { EmailVerifiedGuard } from './EmailVerifiedGuard';
