// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatarFileId?: string;
  avatarUrl?: string; // Direct avatar URL from backend
  avatarFile?: {
    fileUrl: string;
  };
  // For backward compatibility - first auto service
  autoService?: {
    id: string;
    serviceType: 'individual' | 'company';
    firstName: string | null;
    lastName: string | null;
    companyName: string | null;
    isVerified: boolean;
    avatarFileId: string | null;
    avatarFile?: {
      id: string;
      fileUrl: string;
    } | null;
    avatarUrl?: string | null;
  } | null;
  // All auto services owned by user
  autoServices?: Array<{
    id: string;
    serviceType: 'individual' | 'company';
    firstName: string | null;
    lastName: string | null;
    companyName: string | null;
    isVerified: boolean;
    avatarFileId: string | null;
    avatarFile?: {
      id: string;
      fileUrl: string;
    } | null;
    avatarUrl?: string | null;
  }>;
  teamMemberships?: Array<{
    id: string;
    autoServiceId: string;
    role: string;
    isActive: boolean;
  }>;
  createdAt?: string;
  updatedAt?: string;
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
  district?: string; // District/neighborhood (for Yerevan)
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
  services?: Array<{
    id: string;
    name: string;
    category?: string;
  }>;
  profilePhotoFileIds?: string[];
  workPhotoFileIds?: string[];
  yearsOfExperience?: number;
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
  userId: string;
  autoServiceId: string;
  autoServiceProfileId: string;
  assignedEmployeeId?: string;
  scheduledDate: string; // ISO date string (YYYY-MM-DD or full ISO)
  scheduledTime: string; // HH:mm format
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  problemDescription?: string;
  customerNotes?: string;
  confirmedDate?: string; // ISO date string
  confirmedTime?: string; // HH:mm format
  createdAt: string;
  updatedAt: string;
  autoService?: {
    id: string;
    serviceType?: 'individual' | 'company';
    companyName?: string;
    firstName?: string;
    lastName?: string;
    profile?: {
      id: string;
    };
  };
  autoServiceProfile?: {
    id: string;
    autoService?: {
      serviceType?: 'individual' | 'company';
      companyName?: string;
      firstName?: string;
      lastName?: string;
    };
  };
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  // Legacy fields for backward compatibility
  preferredDate?: string;
  preferredTime?: string;
  description?: string;
}

export interface CreateVisitRequest {
  autoServiceId: string;
  scheduledDate: string; // ISO 8601 date string (YYYY-MM-DD)
  scheduledTime: string; // HH:mm format
  problemDescription?: string;
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
    details?: Record<string, unknown>;
  };
}
