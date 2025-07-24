import express from 'express';
import { body } from 'express-validator';
import { sendMessage, getMessages, getActiveChat, endChat, } from '../controllers/chat';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
const router = express.Router();
// Message validation
const messageValidation = [
    body('content').trim().notEmpty().withMessage('Message content is required'),
];
// All chat routes require authentication
router.use(authenticate);
router.post('/message', messageValidation, validate, sendMessage);
router.get('/messages', getMessages);
router.get('/active', getActiveChat);
router.post('/end', endChat);
export default router;
