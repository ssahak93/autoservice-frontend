/**
 * Service type constants
 * Used to avoid hardcoding service type values throughout the application
 */
export const SERVICE_TYPE = {
  INDIVIDUAL: 'individual',
  COMPANY: 'company',
} as const;

export type ServiceType = (typeof SERVICE_TYPE)[keyof typeof SERVICE_TYPE];
