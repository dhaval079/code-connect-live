"use client";

import { useSearchParams } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { io as ClientIO, Socket } from 'socket.io-client';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  lastError: Error | null;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  lastError: null
});

export const useSocket = () => {
  return useContext(SocketContext);
};

  export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastError, setLastError] = useState<Error | null>(null);
    const searchParams = useSearchParams();
    const username = searchParams.get('username');
  useEffect(() => {
    const socketInstance = ClientIO(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:8000', {
      forceNew: true,
      reconnectionAttempts: 5,
      timeout: 10000,
      transports: ['websocket'],
      auth: {
        username
      }
    });

    const handleBeforeUnload = () => {
      const roomId = window.location.pathname.split('/').pop();
      if (socketInstance && roomId) {
        socketInstance.emit('leave', { roomId });
        socketInstance.disconnect();
      }
    };

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Socket connected with ID:', socketInstance.id);
      setIsConnected(true);
      setLastError(null);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setLastError(error);
      setIsConnected(false);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
      setLastError(error);
    });

    
    setSocket(socketInstance);

    return () => {
      handleBeforeUnload();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (socketInstance) {
        socketInstance.removeAllListeners();
        socketInstance.disconnect();
      }
    };
  }, [username]);


  return (
    <SocketContext.Provider value={{ socket, isConnected, lastError }}>
      {children}
    </SocketContext.Provider>
  );
};