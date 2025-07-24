import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All exercise routes require authentication
router.use(authenticate);

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Exercise routes to be implemented',
    data: {
      exercises: [],
    },
  });
});

export default router; 