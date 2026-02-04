'use client';

import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

import { useAuthStore } from '@/stores/authStore';

import { socketService } from '../services/socket.service';

// Global callbacks for socket connection events
const connectCallbacks = new Set<(socket: Socket) => void>();

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

    void socketService
      .connect(accessToken)
      .then((socket) => {
        if (!isMounted) return;
        socketInstance = socket;
        setSocket(socket);

        if (socket.connected) {
          setIsConnected(true);
          // Call callbacks immediately if already connected
          // Use a longer timeout to ensure all components have mounted and registered their callbacks
          setTimeout(() => {
            connectCallbacks.forEach((callback) => {
              try {
                callback(socket);
              } catch (error) {
                console.error('[useSocket] Error in connect callback:', error);
              }
            });
          }, 100);
        }

        const handleConnect = () => {
          setIsConnected(true);
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          // Call all registered callbacks with a small delay to ensure socket.id is available
          setTimeout(() => {
            connectCallbacks.forEach((callback) => {
              try {
                callback(socket);
              } catch (error) {
                console.error('[useSocket] Error in connect callback:', error);
              }
            });
          }, 50);
        };

        const handleDisconnect = () => {
          setIsConnected(false);
        };

        const handleConnectError = (error: Error) => {
          console.error('[useSocket] Socket connection error:', {
            message: error.message,
            error,
            socketId: socket.id,
            connected: socket.connected,
          });
          setIsConnected(false);
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);
      })
      .catch((error) => {
        console.error('[useSocket] Failed to connect socket:', error);
        setIsConnected(false);
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
        reconnectTimeoutRef.current = undefined;
      }
    };
  }, [accessToken]);

  return { socket, isConnected };
}

// Hook to register a callback that will be called when socket connects
export function useOnSocketConnect(callback: (socket: Socket) => void) {
  useEffect(() => {
    connectCallbacks.add(callback);

    // If socket is already connected, call the callback immediately
    const socket = socketService.getSocket();
    if (socket?.connected && socket.id) {
      // Use setTimeout to ensure callback is called after registration
      setTimeout(() => {
        try {
          callback(socket);
        } catch (error) {
          console.error('[useOnSocketConnect] Error calling callback:', error);
        }
      }, 0);
    }

    return () => {
      connectCallbacks.delete(callback);
    };
  }, [callback]);
}
