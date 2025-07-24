import { io } from 'socket.io-client';

const SOCKET_URL = '/';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 3,
  auth: {
    token: null
  }
});

export const connectSocket = (token: string) => {
  if (!token) {
    console.error('No token provided for socket connection');
    return;
  }
  console.log('Attempting socket connection with token length:', token.length);

  // Disconnect if already connected
  if (socket.connected) {
    console.log('Socket already connected, disconnecting first');
    socket.disconnect();
  }

  try {
    // Set auth token and connect
    const authToken = `Bearer ${token}`;
    console.log('Setting auth token with length:', authToken.length);
    
    // Update socket auth configuration
    socket.auth = { token: authToken };
    
    // Force a new connection
    socket.disconnect().connect();
    
    console.log('Socket connection initiated');
  } catch (error) {
    console.error('Error during socket connection:', error);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    console.log('Disconnecting socket');
    socket.disconnect();
  }
};

// Handle connection events
socket.on('connect', () => {
  console.log('Socket connected successfully', {
    id: socket.id,
    auth: socket.auth
  });
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error details:', {
    message: error.message,
    name: error.name,
    auth: socket.auth,
    socketId: socket.id
  });
  
  // Disconnect on auth error to prevent infinite reconnection attempts
  if (error.message === 'Authentication failed') {
    console.log('Authentication failed, disconnecting socket');
    disconnectSocket();
  }
});

// Handle disconnection
socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', {
    reason,
    wasConnected: socket.connected,
    id: socket.id
  });
});

// Handle reconnection attempts
socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('Socket reconnection attempt:', {
    attempt: attemptNumber,
    auth: socket.auth
  });
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Socket reconnected after', attemptNumber, 'attempts');
});

socket.on('error', (error) => {
  console.error('Socket error:', {
    message: error.message,
    name: error.name,
    stack: error.stack
  });
});

export default socket; 