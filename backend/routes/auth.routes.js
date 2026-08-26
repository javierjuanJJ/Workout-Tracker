import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller.js';
import { signupSchema, loginSchema } from '../schemas/auth.schema.js';
import validate from '../middlewares/validate.middleware.js';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

export default router;
