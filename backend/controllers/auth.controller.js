import bcrypt from 'bcryptjs';
import config from '../config.js';
import userModel from '../models/user.model.js';
import { signToken } from '../utils/jwt.js';

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
    const user = await userModel.create({ name, email, passwordHash });

    return res.status(201).json({ success: true, data: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    const token = signToken({ sub: String(user.id), email: user.email });

    return res.status(200).json({
      success: true,
      data: {
        token,
        tokenType: 'Bearer',
        expiresIn: config.jwtExpiresIn,
        user: toPublicUser(user),
      },
    });
  } catch (error) {
    return next(error);
  }
}
