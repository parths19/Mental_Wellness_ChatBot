import { validationResult } from 'express-validator';
import { AppError } from './errorHandler';
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        throw new AppError(errorMessages.join(', '), 400);
    }
    next();
};
