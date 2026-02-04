import axios from 'axios';
import { io, Socket } from 'socket.io-client';

import { getCurrentLocale } from '@/lib/utils/i18n';

const getSocketUrl = () => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:3000';
  const baseUrl = apiUrl.replace(/\/api$/, '');
  return baseUrl;
};

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

  async connect(token: string): Promise<Socket> {
    if (this.socket?.connected && this.currentToken === token) {
      return this.socket;
    }

    if (this.socket) {
      if (this.currentToken !== token || !this.socket.connected) {
        this.socket.disconnect();
        this.socket.removeAllListeners();
        this.socket = null;
      } else {
        return this.socket;
      }
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();
      const timeUntilExpiry = exp - now;

      if (timeUntilExpiry < 5 * 60 * 1000) {
        const newToken = await this.refreshToken();
        if (newToken) {
          token = newToken;
        }
      }
    } catch {
      // ignore token parse failures
    }

    this.currentToken = token;
    const socketUrl = getSocketUrl();
    const namespaceUrl = `${socketUrl}/chat`;

    this.socket = io(namespaceUrl, {
      path: '/socket.io',
      auth: { token },
      query: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000,
      forceNew: false,
      upgrade: true,
      rememberUpgrade: false,
    });

    const handleConnect = () => {
      this.reconnectAttempts = 0;
    };

    const handleDisconnect = () => {
      // Socket.io will reconnect
    };

    const handleConnectError = async (error: Error) => {
      console.error('[Socket] Connection error:', {
        message: error.message,
        error: error,
        socketId: this.socket?.id,
        connected: this.socket?.connected,
        reconnectAttempts: this.reconnectAttempts,
      });
      const errorMessage = error.message || '';
      if (
        errorMessage.includes('jwt expired') ||
        errorMessage.includes('jwt malformed') ||
        errorMessage.includes('invalid token') ||
        errorMessage.includes('Unauthorized')
      ) {
        try {
          const newToken = await this.refreshToken();
          if (newToken) {
            this.socket?.disconnect();
            this.socket?.removeAllListeners();
            this.socket = null;
            this.currentToken = null;
            return;
          }
        } catch {
          this.socket?.disconnect();
          this.socket?.removeAllListeners();
          this.socket = null;
          this.currentToken = null;
          return;
        }
      }
      this.reconnectAttempts++;
    };

    this.socket.on('connect', handleConnect);
    this.socket.on('disconnect', handleDisconnect);
    this.socket.on('connect_error', handleConnectError);

    return this.socket;
  }

  private async refreshToken(): Promise<string | null> {
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
        const locale = getCurrentLocale();
        const response = await axios.post(
          `${apiBaseUrl}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Accept-Language': locale,
            },
          }
        );

        let accessToken: string | undefined;
        let newRefreshToken: string | undefined;

        if (response.data?.data?.accessToken) {
          accessToken = response.data.data.accessToken;
          newRefreshToken = response.data.data.refreshToken;
        } else if (response.data?.accessToken) {
          accessToken = response.data.accessToken;
          newRefreshToken = response.data.refreshToken;
        }

        if (!accessToken || !newRefreshToken) {
          throw new Error('Invalid refresh token response');
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          try {
            const { useAuthStore } = await import('@/stores/authStore');
            useAuthStore.getState().setTokens(accessToken, newRefreshToken);
          } catch {
            // ignore
          }
        }

        return accessToken;
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          try {
            const { useAuthStore } = await import('@/stores/authStore');
            useAuthStore.getState().logout();
          } catch {
            // ignore
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
