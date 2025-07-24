import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All resource routes require authentication
router.use(authenticate);

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Resource routes to be implemented',
    data: {
      resources: [],
    },
  });
});

export default router; 