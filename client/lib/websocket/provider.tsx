'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useNotificationWebSocket } from '@/lib/websocket/notifications';

interface WebSocketContextType {
  notifications: {
    isConnected: boolean;
    reconnect: () => void;
    disconnect: () => void;
  };
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const notifications = useNotificationWebSocket();

  return (
    <WebSocketContext.Provider value={{ notifications }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
