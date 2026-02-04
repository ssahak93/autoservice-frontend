import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  emailVerified?: boolean;
  firstName: string;
  lastName: string;
  avatarFileId?: string;
  avatarFile?: {
    fileUrl: string;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Initialize isAuthenticated based on token presence
      const _initializeAuth = () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          const currentState = get();
          // If token exists but isAuthenticated is false, set it to true
          // This handles page reloads where user might not be loaded yet
          if (token && !currentState.isAuthenticated) {
            return { isAuthenticated: true };
          }
        }
        return {};
      };

      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        // Always start with false on server to prevent hydration mismatch
        // Will be updated on client after rehydration
        isAuthenticated: false,
        isLoading: false,
        setUser: (user) => {
          set({ user, isAuthenticated: !!user });
        },
        setTokens: (accessToken, refreshToken) => {
          // Save tokens to both Zustand store and localStorage for immediate API client access
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            // Also save to cookies for middleware access
            // Set cookie with 7 days expiration, httpOnly=false (needed for client access), secure in production
            const expires = new Date();
            expires.setDate(expires.getDate() + 7);
            document.cookie = `accessToken=${accessToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
          }
          set({ accessToken, refreshToken, isAuthenticated: true });
        },
        logout: () => {
          // Clear both Zustand store and localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // Also clear cookies
            document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          }
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        },
        setLoading: (isLoading) => set({ isLoading }),
      };
    },
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, only set isAuthenticated to true if we have BOTH token AND user
        // This prevents making API calls with invalid tokens
        // The token will be validated by the /api/auth/me request, which will set isAuthenticated properly
        if (state && typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          const storedToken = state.accessToken;

          // Only set isAuthenticated to true if we have token AND user
          // If we only have token but no user, keep isAuthenticated as false
          // This will prevent premature API calls - the token will be validated by useAuth hook
          if (!token && !storedToken) {
            // No token exists, clear auth state
            state.isAuthenticated = false;
            state.user = null;
          } else if ((token || storedToken) && state.user) {
            // We have both token and user, so user is authenticated
            state.isAuthenticated = true;
          } else {
            // We have token but no user - don't set isAuthenticated yet
            // The useAuth hook will validate the token and set isAuthenticated after successful /api/auth/me
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);
