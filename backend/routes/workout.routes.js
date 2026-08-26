import { Router } from 'express';
import {
  create,
  list,
  update,
  schedule,
  remove,
} from '../controllers/workout.controller.js';
import {
  createWorkoutSchema,
  updateWorkoutSchema,
  scheduleWorkoutSchema,
  listWorkoutsQuerySchema,
  idParamSchema,
} from '../schemas/workout.schema.js';
import validate from '../middlewares/validate.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createWorkoutSchema), create);
router.get('/', validate(listWorkoutsQuerySchema, 'query'), list);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateWorkoutSchema), update);
router.delete('/:id', validate(idParamSchema, 'params'), remove);
router.post(
  '/:id/schedule',
  validate(idParamSchema, 'params'),
  validate(scheduleWorkoutSchema),
  schedule
);

export default router;
