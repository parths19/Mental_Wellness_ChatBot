import jwt from 'jsonwebtoken';
import { User } from './models/User';
import { Chat } from './models/Chat';
import { logger } from './utils/logger';
export const setupSocketHandlers = (io) => {
    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                throw new Error('Authentication required');
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key');
            const user = await User.findById(decoded.id);
            if (!user) {
                throw new Error('User not found');
            }
            socket.userId = decoded.id;
            next();
        }
        catch (error) {
            next(new Error('Authentication failed'));
        }
    });
    io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.userId}`);
        // Join user's room
        socket.join(socket.userId);
        // Handle typing status
        socket.on('typing:start', () => {
            socket.to(socket.userId).emit('typing:start');
        });
        socket.on('typing:stop', () => {
            socket.to(socket.userId).emit('typing:stop');
        });
        // Handle message read status
        socket.on('message:read', async (messageId) => {
            try {
                const chat = await Chat.findOne({
                    userId: socket.userId,
                    'messages._id': messageId,
                });
                if (chat) {
                    const message = chat.messages.find((msg) => msg._id?.toString() === messageId);
                    if (message) {
                        message.read = true;
                        await chat.save();
                        socket.to(socket.userId).emit('message:read', messageId);
                    }
                }
            }
            catch (error) {
                logger.error('Error marking message as read:', error);
            }
        });
        // Handle exercise progress
        socket.on('exercise:progress', async (data) => {
            try {
                socket.to(socket.userId).emit('exercise:progress', data);
            }
            catch (error) {
                logger.error('Error updating exercise progress:', error);
            }
        });
        // Handle disconnection
        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${socket.userId}`);
        });
    });
};
