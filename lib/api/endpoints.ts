// API Endpoints constants

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },

  // Service Providers
  SERVICE_PROVIDERS: {
    LIST: '/service-providers',
    DETAIL: (id: string) => `/service-providers/${id}`,
    REVIEWS: (id: string) => `/service-providers/${id}/reviews`,
  },

  // Visits
  VISITS: {
    LIST: '/visits',
    CREATE: '/visits',
    DETAIL: (id: string) => `/visits/${id}`,
    UPDATE_STATUS: (id: string) => `/visits/${id}/status`,
  },

  // Reviews
  REVIEWS: {
    CREATE: '/reviews',
    LIST: '/reviews',
  },

  // Files
  FILES: {
    UPLOAD: '/files/upload',
    UPLOAD_MULTIPLE: '/files/upload-multiple',
    GET: (id: string) => `/files/${id}`,
    DELETE: (id: string) => `/files/${id}`,
  },

  // Chat
  CHAT: {
    MESSAGES: (visitId: string) => `/chat/visits/${visitId}/messages`,
    SEND_MESSAGE: (visitId: string) => `/chat/visits/${visitId}/messages`,
  },

  // Service Types
  SERVICE_TYPES: {
    LIST: '/service-types',
    BY_CATEGORY: (category: string) => `/service-types/category/${category}`,
    BY_CATEGORY_AND_GROUP: (category: string, group: string) =>
      `/service-types/category/${category}/group/${group}`,
  },
} as const;
