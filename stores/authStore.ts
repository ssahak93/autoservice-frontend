import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
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
          }
          set({ accessToken, refreshToken, isAuthenticated: true });
        },
        logout: () => {
          // Clear both Zustand store and localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
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
        // After rehydration, check if token exists and update isAuthenticated
        // This runs only on client, so it's safe to check localStorage
        if (state && typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          const storedToken = state.accessToken;

          // If we have a token (either in localStorage or in state), set isAuthenticated to true
          if ((token || storedToken) && !state.isAuthenticated) {
            state.isAuthenticated = true;
          } else if (!token && !storedToken && state.isAuthenticated) {
            // If no token exists, clear auth state
            state.isAuthenticated = false;
            state.user = null;
          }
        }
      },
    }
  )
);
