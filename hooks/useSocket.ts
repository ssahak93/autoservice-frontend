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
    const socketInstance = socketService.connect(accessToken);
    setSocket(socketInstance);

    // Update connection state immediately if already connected
    if (socketInstance.connected) {
      setIsConnected(true);
    }

    const handleConnect = () => {
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleConnectError = () => {
      setIsConnected(false);
    };

    // Add event listeners
    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('connect_error', handleConnectError);

    return () => {
      // Remove event listeners on cleanup
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('connect_error', handleConnectError);
      const currentTimeout = reconnectTimeoutRef.current;
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
    };
  }, [accessToken]);

  return { socket, isConnected };
}
