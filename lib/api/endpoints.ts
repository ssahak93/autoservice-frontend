// API Endpoints constants

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/me',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    SETTINGS: '/auth/settings',
    DELETE_ACCOUNT: '/auth/account',
  },

  // Search
  SEARCH: {
    AUTO_SERVICES: '/search/auto-services',
    RECOMMENDATIONS: '/search/recommendations',
    SUGGESTIONS: '/search/suggestions',
    TRACK_VIEW: (profileId: string) => `/search/profiles/${profileId}/view`,
    TRACK_CLICK: (profileId: string) => `/search/profiles/${profileId}/click`,
    RECENT_SEARCHES: '/search/history/recent-searches',
    RECENT_VIEWS: '/search/history/recent-views',
    CLEAR_SEARCHES: '/search/history/clear-searches',
    CLEAR_VIEWS: '/search/history/clear-views',
  },

  // Feature Flags (Public)
  FEATURE_FLAGS: {
    LIST: '/feature-flags',
  },

  // Auto Services (Public)
  AUTO_SERVICES: {
    BASE: '/auto-services',
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
    // Create auto service
    CREATE: '/auto-services',
    // Update auto service info
    UPDATE: (id: string) => `/auto-services/${id}`,
    // Delete auto service
    DELETE: (id: string) => `/auto-services/${id}`,
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
    HISTORY: (id: string) => `/visits/${id}/history`,
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
    DISTRICTS_WITH_BOUNDS: '/locations/districts/with-bounds',
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

  // Favorites
  FAVORITES: {
    LIST: '/favorites',
    ADD: (profileId: string) => `/favorites/${profileId}`,
    REMOVE: (profileId: string) => `/favorites/${profileId}`,
    CHECK: (profileId: string) => `/favorites/${profileId}/check`,
  },

  // Analytics
  ANALYTICS: {
    SERVICE: (profileId: string) => `/analytics/services/${profileId}`,
  },

  // Admin
  ADMIN: {
    FEATURE_FLAGS: '/admin/feature-flags',
    FEATURE_FLAG: (key: string) => `/admin/feature-flags/${key}`,
    TOGGLE_FEATURE_FLAG: (key: string) => `/admin/feature-flags/${key}/toggle`,
  },
} as const;
