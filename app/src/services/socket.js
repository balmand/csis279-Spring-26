import { io } from 'socket.io-client';

const rawSocketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_LEGACY_API_URL || '';
const SOCKET_URL = rawSocketUrl.replace(/\/+$/, '');
export const SOCKET_ENABLED = Boolean(SOCKET_URL);

let socket;

export const getSocket = () => {
  if (!SOCKET_ENABLED) {
    return null;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }

  return socket;
};
