import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('Email already registered', 400);
        }
        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            preferences: {
                theme: 'light',
                notifications: true,
                language: 'en',
            },
        });
        // Generate token
        const token = user.generateAuthToken();
        logger.info(`New user registered: ${user.email}`);
        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    preferences: user.preferences,
                },
                token,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Find user and include password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new AppError('Invalid email or password', 401);
        }
        // Generate token
        const token = user.generateAuthToken();
        logger.info(`User logged in: ${user.email}`);
        res.json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    preferences: user.preferences,
                },
                token,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        res.json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    preferences: user.preferences,
                    emergencyContacts: user.emergencyContacts,
                    moodLog: user.moodLog,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateProfile = async (req, res, next) => {
    try {
        const allowedUpdates = ['name', 'preferences', 'emergencyContacts'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
        if (!isValidOperation) {
            throw new AppError('Invalid updates', 400);
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        updates.forEach((update) => {
            user[update] = req.body[update];
        });
        await user.save();
        logger.info(`User profile updated: ${user.email}`);
        res.json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    preferences: user.preferences,
                    emergencyContacts: user.emergencyContacts,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
