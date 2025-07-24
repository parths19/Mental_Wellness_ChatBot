import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from './errorHandler';

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || '35da518f2b05a3c6244d9a20f3470ef6c3c2288cedc620abe74520d41fcfb804'
    ) as JwtPayload;

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
}; 