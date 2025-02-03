import { Socket } from "socket.io-client";
import type { DefaultEventsMap } from '@socket.io/component-emitter';
import { io } from "socket.io-client";

export const initSocket = async (): Promise<Socket<DefaultEventsMap, DefaultEventsMap>> => {
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';
  
  const options = {
    forceNew: true,
    reconnectionAttempts: Infinity,
    timeout: 10000,
    transports: ['websocket']
  };

  return new Promise((resolve, reject) => {
    try {
      const socket = io(SOCKET_URL, options);

      socket.on('connect', () => {
        console.log('Socket connected with ID:', socket.id);
        resolve(socket);
      });

      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        reject(err);
      });

      // Set up reconnection handling
      socket.on('reconnect_attempt', () => {
        console.log('Attempting to reconnect...');
      });

      socket.on('reconnect', () => {
        console.log('Reconnected successfully');
      });

    } catch (err) {
      console.error('Socket initialization error:', err);
      reject(err);
    }
  });
};