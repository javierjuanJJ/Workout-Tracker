import { verifyToken } from '../utils/jwt.js';

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, error: 'Token de autenticación requerido' });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: Number(payload.sub), email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'Token inválido o expirado' });
  }
}

export default authMiddleware;
