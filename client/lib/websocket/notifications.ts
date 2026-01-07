'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Notification } from '@/lib/types/notification';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

interface WebSocketMessage {
  type: string;
  data: Notification;
}

export function useNotificationWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  
  const queryClient = useQueryClient();
  const { accessToken, isAuthenticated } = useAuthStore();
  
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  const connect = useCallback(() => {
    if (!isAuthenticated || !accessToken) {
      return;
    }

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      // Connect with token in query params (for JWT auth middleware)
      const wsUrl = `${WS_URL}/ws/notifications/?token=${accessToken}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Notification WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          if (message.type === 'notification') {
            // Show toast notification
            const notification = message.data;
            toast.info(notification.title, {
              description: notification.message,
              action: notification.action_url ? {
                label: 'View',
                onClick: () => window.location.href = notification.action_url!,
              } : undefined,
            });
            
            // Invalidate notifications cache to refresh the list
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('Notification WebSocket closed:', event.code);
        setIsConnected(false);
        wsRef.current = null;
        
        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          reconnectAttemptsRef.current++;
          
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('Notification WebSocket error:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [isAuthenticated, accessToken, queryClient]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, accessToken, connect, disconnect]);

  return { isConnected, reconnect: connect, disconnect };
}
