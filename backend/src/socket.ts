import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from './models/User';
import { Chat, IMessage } from './models/Chat';
import { logger } from './utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Middleware to authenticate socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      logger.info('Socket authentication attempt', {
        handshake: {
          auth: socket.handshake.auth,
          query: socket.handshake.query
        }
      });

      // Try to get token from different possible locations
      let authToken = socket.handshake.auth.token || socket.handshake.headers.authorization;
      
      if (!authToken) {
        logger.error('No auth token provided in any location');
        throw new Error('Authentication required');
      }

      // Clean up the token format
      authToken = authToken.replace(/^Bearer\s+/i, '').trim();
      
      if (!authToken) {
        logger.error('Token is empty after cleanup');
        throw new Error('Invalid token format');
      }

      logger.info('Processing token', { tokenLength: authToken.length });
      
      try {
        const decoded = jwt.verify(
          authToken,
          process.env.JWT_SECRET || '35da518f2b05a3c6244d9a20f3470ef6c3c2288cedc620abe74520d41fcfb804'
        ) as { id: string };

        logger.info('Token verified successfully', { userId: decoded.id });

        const user = await User.findById(decoded.id);
        if (!user) {
          logger.error('User not found in database', { userId: decoded.id });
          throw new Error('User not found');
        }

        socket.userId = decoded.id;
        logger.info('Socket authenticated successfully', {
          userId: decoded.id,
          socketId: socket.id
        });
        
        next();
      } catch (jwtError) {
        logger.error('JWT verification failed', { 
          error: jwtError,
          tokenLength: authToken.length
        });
        throw new Error('Invalid token');
      }
    } catch (error) {
      logger.error('Socket authentication error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        socketId: socket.id
      });
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info('New socket connection', {
      userId: socket.userId,
      socketId: socket.id
    });

    // Join user's room
    if (socket.userId) {
      socket.join(socket.userId);
      logger.info('User joined room', {
        userId: socket.userId,
        socketId: socket.id
      });
    }

    // Handle typing status
    socket.on('typing:start', () => {
      if (socket.userId) {
        socket.to(socket.userId).emit('typing:start');
      }
    });

    socket.on('typing:stop', () => {
      if (socket.userId) {
        socket.to(socket.userId).emit('typing:stop');
      }
    });

    // Handle message read status
    socket.on('message:read', async (messageId: string) => {
      try {
        if (!socket.userId) {
          logger.error('No userId for message:read event');
          return;
        }

        const chat = await Chat.findOne({
          userId: socket.userId,
          'messages._id': messageId,
        });

        if (chat) {
          const message = chat.messages.find(
            (msg: IMessage) => msg._id?.toString() === messageId
          );
          if (message) {
            message.read = true;
            await chat.save();
            socket.to(socket.userId).emit('message:read', messageId);
          }
        }
      } catch (error) {
        logger.error('Error marking message as read:', error);
      }
    });

    // Handle exercise progress
    socket.on(
      'exercise:progress',
      async (data: { exerciseId: string; progress: number }) => {
        try {
          if (socket.userId) {
            socket.to(socket.userId).emit('exercise:progress', data);
          }
        } catch (error) {
          logger.error('Error updating exercise progress:', error);
        }
      }
    );

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', {
        userId: socket.userId,
        socketId: socket.id,
        reason
      });
    });
  });
}; 