import { useEffect } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '../api/socket';

export const useSocket = (projectId?: string) => {
  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    if (projectId) {
      socket.emit('joinProject', projectId);
    }

    return () => {
      if (projectId) {
        socket.emit('leaveProject', projectId);
      }
      // We don't necessarily want to disconnect the entire socket on every page change,
      // as it might be used for global notifications.
    };
  }, [projectId]);

  const on = (event: string, callback: (...args: any[]) => void) => {
    const socket = getSocket();
    socket.on(event, callback);
    return () => socket.off(event, callback);
  };

  const emit = (event: string, ...args: any[]) => {
    const socket = getSocket();
    socket.emit(event, ...args);
  };

  return { on, emit };
};
