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
    // Profile management
    PROFILE: '/auto-services/profile',
    CREATE_PROFILE: '/auto-services/profile',
    UPDATE_PROFILE: '/auto-services/profile',
    PUBLISH_PROFILE: '/auto-services/profile/publish',
    UPLOAD_PHOTO: '/auto-services/profile/upload-photo',
    DELETE_PHOTO: '/auto-services/profile/photo/delete',
    REORDER_PHOTOS: '/auto-services/profile/photos/reorder',
    // Available auto services (for owner/team members)
    AVAILABLE: '/auto-services/available',
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
    COMPLETE: (id: string) => `/visits/${id}/complete`,
    RESCHEDULE: (id: string) => `/visits/${id}/reschedule`,
    // Auto service endpoints
    AUTO_SERVICE_LIST: '/visits/auto-service',
    AUTO_SERVICE_STATISTICS: '/visits/auto-service/statistics',
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
    CONVERSATIONS: '/chat/service/conversations',
    UNREAD_COUNT: (visitId: string) => `/chat/visits/${visitId}/unread-count`,
    MARK_AS_READ: (visitId: string) => `/chat/visits/${visitId}/messages/read`,
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

  // Team Management
  TEAM: {
    LIST: '/auto-services/me/team',
    GENERATE_QR: '/auto-services/me/team/generate-qr',
    UPDATE: (memberId: string) => `/auto-services/me/team/${memberId}`,
    REMOVE: (memberId: string) => `/auto-services/me/team/${memberId}`,
  },
} as const;
