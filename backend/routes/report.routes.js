import { Router } from 'express';
import { progress } from '../controllers/report.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/progress', authMiddleware, progress);

export default router;
