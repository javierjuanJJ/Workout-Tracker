import { Router } from 'express';
import authRoutes from './auth.routes.js';
import workoutRoutes from './workout.routes.js';
import reportRoutes from './report.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/workouts', workoutRoutes);
router.use('/reports', reportRoutes);

export default router;
