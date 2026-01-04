// API Endpoints constants

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    SETTINGS: '/auth/settings',
  },

  // Auto Services (Public)
  AUTO_SERVICES: {
    SEARCH: '/search/auto-services',
    DETAIL: (id: string) => `/auto-services/${id}`,
    REVIEWS: (id: string) => `/auto-services/${id}/reviews`,
  },

  // Visits
  VISITS: {
    LIST: '/visits/user', // Get user's visits
    CREATE: '/visits',
    DETAIL: (id: string) => `/visits/${id}`,
    UPDATE: (id: string) => `/visits/${id}`,
    UPDATE_STATUS: (id: string) => `/visits/${id}/status`,
    CANCEL: (id: string) => `/visits/${id}/cancel`,
    DELETE: (id: string) => `/visits/${id}`,
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

  // Locations
  LOCATIONS: {
    REGIONS: '/locations/regions',
    CITIES: '/locations/cities',
    DISTRICTS: '/locations/districts',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    STATS: '/notifications/stats',
    MARK_AS_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_AS_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
    DELETE_ALL_READ: '/notifications/read',
  },
} as const;
