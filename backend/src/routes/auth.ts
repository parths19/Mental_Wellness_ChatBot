import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile } from '../controllers/auth';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();

// Register validation
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain a special character'),
];

// Login validation
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Profile update validation
const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('preferences').optional().isObject().withMessage('Invalid preferences format'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Invalid theme value'),
  body('preferences.notifications')
    .optional()
    .isBoolean()
    .withMessage('Invalid notifications value'),
  body('preferences.language')
    .optional()
    .isString()
    .withMessage('Invalid language value'),
];

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/profile', authenticate, getProfile);
router.patch(
  '/profile',
  authenticate,
  updateProfileValidation,
  validate,
  updateProfile
);

export default router; 