import axios from 'axios';
import { io, Socket } from 'socket.io-client';

// Get WebSocket URL - remove /api suffix if present, add /chat namespace
const getSocketUrl = () => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:3000';
  // Remove /api suffix if present
  const baseUrl = apiUrl.replace(/\/api$/, '');
  return baseUrl;
};

// Get API base URL for refresh token request
const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
};

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private currentToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  connect(token: string): Socket {
    // If socket is already connected with the same token, return it
    if (this.socket?.connected && this.currentToken === token) {
      return this.socket;
    }

    // If token changed or socket exists but not connected, disconnect and create new
    if (this.socket) {
      // Only disconnect if token changed or socket is not connected
      if (this.currentToken !== token || !this.socket.connected) {
        this.socket.disconnect();
        this.socket.removeAllListeners();
        this.socket = null;
      } else {
        // Same token and connected, return existing socket
        return this.socket;
      }
    }

    this.currentToken = token;
    const socketUrl = `${getSocketUrl()}/chat`;

    this.socket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000, // 20 seconds timeout
      forceNew: false, // Reuse connection if possible
    });

    // Store handlers to remove them later if needed
    const handleConnect = () => {
      this.reconnectAttempts = 0;
    };

    // Don't manually reconnect - let socket.io handle it automatically
    // The 'reconnection: true' option will handle reconnections
    const handleDisconnect = () => {
      // Socket.io will automatically attempt to reconnect
      // No need to manually call connect()
    };

    const handleConnectError = async (error: Error) => {
      // Check if error is due to expired JWT
      const errorMessage = error.message || '';
      if (
        errorMessage.includes('jwt expired') ||
        errorMessage.includes('jwt malformed') ||
        errorMessage.includes('invalid token')
      ) {
        // Token expired, try to refresh
        try {
          const newToken = await this.refreshToken();
          if (newToken) {
            // Disconnect current socket to prevent further reconnection attempts with old token
            this.socket?.disconnect();
            this.socket?.removeAllListeners();
            this.socket = null;
            this.currentToken = null;

            // The useSocket hook will detect the token change in useAuthStore
            // and reconnect automatically via useEffect dependency on accessToken
            return;
          }
        } catch (refreshError) {
          // Refresh failed, disconnect and stop reconnection attempts
          this.socket?.disconnect();
          this.socket?.removeAllListeners();
          this.socket = null;
          this.currentToken = null;
          return;
        }
      }
      this.reconnectAttempts++;
    };

    // Add event listeners
    this.socket.on('connect', handleConnect);
    this.socket.on('disconnect', handleDisconnect);
    this.socket.on('connect_error', handleConnectError);

    return this.socket;
  }

  private async refreshToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshToken =
          typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const apiBaseUrl = getApiBaseUrl();
        const response = await axios.post(`${apiBaseUrl}/auth/refresh`, {
          refreshToken,
        });

        // Extract tokens from response
        let accessToken: string | undefined;
        let newRefreshToken: string | undefined;

        if (response.data?.data?.accessToken) {
          // Wrapped format: { success: true, data: { accessToken, refreshToken } }
          accessToken = response.data.data.accessToken;
          newRefreshToken = response.data.data.refreshToken;
        } else if (response.data?.accessToken) {
          // Direct format: { accessToken, refreshToken }
          accessToken = response.data.accessToken;
          newRefreshToken = response.data.refreshToken;
        }

        if (!accessToken || !newRefreshToken) {
          throw new Error('Invalid refresh token response');
        }

        // Update tokens in localStorage and Zustand store
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Update Zustand store if available
          try {
            const { useAuthStore } = await import('@/stores/authStore');
            useAuthStore.getState().setTokens(accessToken, newRefreshToken);
          } catch (e) {
            // Store might not be available, continue anyway
          }
        }

        return accessToken;
      } catch (error) {
        // Refresh failed, clear tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          // Clear Zustand store if available
          try {
            const { useAuthStore } = await import('@/stores/authStore');
            useAuthStore.getState().logout();
          } catch (e) {
            // Store might not be available, continue anyway
          }
        }
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
      this.currentToken = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
