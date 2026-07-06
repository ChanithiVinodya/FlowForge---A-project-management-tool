import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = useAuthStore.getState().accessToken;
    
    // We connect to the same origin in dev (proxied) or the specific API URL
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

    socket = io(socketUrl, {
      auth: {
        token: `Bearer ${token}`,
      },
      autoConnect: false,
    });

    socket.on('connect_error', async (err) => {
      if (err.message === 'TOKEN_EXPIRED') {
        try {
          // Attempt to refresh the token via API
          const response = await axios.post('/api/auth/refresh', {}, { 
            baseURL: import.meta.env.VITE_API_URL || '/api',
            withCredentials: true 
          });
          const { accessToken, user } = response.data;

          // Update the store
          useAuthStore.getState().setAuth(user, accessToken);

          // Update socket auth and reconnect
          if (socket) {
            socket.auth = { token: `Bearer ${accessToken}` };
            socket.connect();
          }
        } catch (refreshError) {
          console.error('Socket token refresh failed:', refreshError);
          useAuthStore.getState().logout();
        }
      } else {
        console.error('Socket connection error:', err.message);
      }
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  const token = useAuthStore.getState().accessToken;
  
  // Update token in case it changed since socket initialization
  s.auth = { token: `Bearer ${token}` };
  
  if (!s.connected) {
    s.connect();
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
