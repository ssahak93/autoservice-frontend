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
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    SETTINGS: '/auth/settings',
    DELETE_ACCOUNT: '/auth/account',
  },

  // Search
  SEARCH: {
    PROVIDERS: '/search/providers',
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

  // Providers (Public)
  PROVIDERS: {
    BASE: '/providers',
    SEARCH: '/search/providers',
    DETAIL: (id: string) => `/providers/${id}`,
    REVIEWS: (id: string) => `/providers/${id}/reviews`,
    // Branch management (renamed from profile)
    BRANCH: '/providers/branch',
    CREATE_BRANCH: '/providers/branch',
    UPDATE_BRANCH: '/providers/branch',
    PUBLISH_BRANCH: '/providers/branch/publish',
    UPLOAD_PHOTO: '/providers/branch/upload-photo',
    DELETE_PHOTO: '/providers/branch/photo/delete',
    REORDER_PHOTOS: '/providers/branch/photos/reorder',
    // Available providers (for owner/team members)
    AVAILABLE: '/providers/available',
    // Create provider
    CREATE: '/providers',
    // Update provider info
    UPDATE: (id: string) => `/providers/${id}`,
    // Delete provider
    DELETE: (id: string) => `/providers/${id}`,
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
    // Provider endpoints
    PROVIDER_LIST: '/visits/provider',
    PROVIDER_STATISTICS: '/visits/provider/statistics',
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

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    BY_CODE: (code: string) => `/categories/${code}`,
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
    COMMUNITIES: '/locations/communities', // Replaces cities and districts
  },

  // Geocoding
  GEOCODING: {
    REVERSE: '/geocoding/reverse',
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
    LIST: '/providers/me/team',
    GENERATE_QR: '/providers/me/team/generate-qr',
    UPDATE: (memberId: string) => `/providers/me/team/${memberId}`,
    REMOVE: (memberId: string) => `/providers/me/team/${memberId}`,
    CHECK_INVITATION: (code: string) => `/providers/team/invitation/${code}`,
    ACCEPT_INVITATION: '/providers/team/accept-qr',
    PENDING_INVITATIONS: '/providers/me/team/invitations',
    CANCEL_INVITATION: (invitationId: string) => `/providers/me/team/invitations/${invitationId}`,
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

  // Vehicles
  VEHICLES: {
    LIST: '/users/me/vehicles',
    GET: (id: string) => `/users/me/vehicles/${id}`,
    CREATE: '/users/me/vehicles',
    UPDATE: (id: string) => `/users/me/vehicles/${id}`,
    DELETE: (id: string) => `/users/me/vehicles/${id}`,
  },

  // Admin
  ADMIN: {
    FEATURE_FLAGS: '/admin/feature-flags',
    FEATURE_FLAG: (key: string) => `/admin/feature-flags/${key}`,
    TOGGLE_FEATURE_FLAG: (key: string) => `/admin/feature-flags/${key}/toggle`,
  },
} as const;
