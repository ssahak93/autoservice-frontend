// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatarFileId?: string;
  avatarFile?: {
    fileUrl: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

// Auto Service types
export interface AutoService {
  id: string;
  serviceType: 'individual' | 'company';
  companyName?: string;
  firstName?: string;
  lastName?: string;
  description?: string;
  specialization?: string;
  address: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  workingHours?: WorkingHours;
  averageRating?: number;
  totalReviews: number;
  isVerified: boolean;
  avatarFile?: {
    fileUrl: string;
  };
  profile?: {
    profilePhotoFileIds?: string[];
    workPhotoFileIds?: string[];
  };
}

export interface WorkingHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

// Visit types
export interface Visit {
  id: string;
  autoServiceProfileId: string;
  driverId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  preferredDate: string;
  preferredTime: string;
  confirmedDate?: string;
  confirmedTime?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitRequest {
  autoServiceProfileId: string;
  preferredDate: string;
  preferredTime: string;
  description?: string;
  serviceTypeIds?: string[];
}

// Review types
export interface Review {
  id: string;
  rating: number;
  comment?: string;
  driverId: string;
  autoServiceProfileId: string;
  visitId?: string;
  createdAt: string;
  driver?: {
    firstName: string;
    lastName: string;
    avatarFile?: {
      fileUrl: string;
    };
  };
}

export interface CreateReviewRequest {
  autoServiceProfileId: string;
  visitId?: string;
  rating: number;
  comment?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
