'use client';

import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

import { socketService } from '@/lib/services/socket.service';
import { useAuthStore } from '@/stores/authStore';

export function useSocket() {
  const { accessToken } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!accessToken) {
      // Disconnect if no token
      socketService.disconnect();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    // Connect socket (will reuse existing connection if token is the same)
    // Note: connect is now async to handle token refresh
    let socketInstance: Socket | null = null;
    let isMounted = true;

    void socketService.connect(accessToken).then((socket) => {
      if (!isMounted) return;
      socketInstance = socket;
      setSocket(socket);

      // Update connection state immediately if already connected
      if (socket.connected) {
        setIsConnected(true);
      }

      const handleConnect = () => {
        setIsConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      const handleDisconnect = (_reason: string) => {
        setIsConnected(false);
      };

      const handleConnectError = (_error: Error) => {
        setIsConnected(false);
      };

      // Add event listeners
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleConnectError);
    });

    return () => {
      isMounted = false;
      // Remove event listeners on cleanup
      if (socketInstance) {
        socketInstance.off('connect');
        socketInstance.off('disconnect');
        socketInstance.off('connect_error');
      }
      // Copy ref value to variable for cleanup
      const timeoutId = reconnectTimeoutRef.current;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [accessToken]);

  return { socket, isConnected };
}
