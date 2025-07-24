import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from './errorHandler';
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new AppError('Authentication required', 401);
        }
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key');
        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        // Attach user to request object
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new AppError('Invalid token', 401));
        }
        else {
            next(error);
        }
    }
};
