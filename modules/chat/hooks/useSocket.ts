'use client';

import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

import { useAuthStore } from '@/stores/authStore';

import { socketService } from '../services/socket.service';

export function useSocket() {
  const { accessToken } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!accessToken) {
      socketService.disconnect();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    let socketInstance: Socket | null = null;
    let isMounted = true;

    void socketService.connect(accessToken).then((socket) => {
      if (!isMounted) return;
      socketInstance = socket;
      setSocket(socket);

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

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleConnectError);
    });

    return () => {
      isMounted = false;
      if (socketInstance) {
        socketInstance.off('connect');
        socketInstance.off('disconnect');
        socketInstance.off('connect_error');
      }
      const timeoutId = reconnectTimeoutRef.current;
      if (timeoutId) {
        clearTimeout(timeoutId);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [accessToken]);

  return { socket, isConnected };
}
