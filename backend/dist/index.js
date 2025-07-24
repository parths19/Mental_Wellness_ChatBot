import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { setupSocketHandlers } from './socket';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import exerciseRoutes from './routes/exercises';
import resourceRoutes from './routes/resources';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});
// Middleware
app.use(cors());
app.use(express.json());
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/resources', resourceRoutes);
// Socket.IO setup
setupSocketHandlers(io);
// Error handling
app.use(errorHandler);
// Database connection
mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mental-wellness')
    .then(() => {
    logger.info('Connected to MongoDB');
    // Start server
    const port = process.env.PORT || 5000;
    httpServer.listen(port, () => {
        logger.info(`Server is running on port ${port}`);
    });
})
    .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
});
