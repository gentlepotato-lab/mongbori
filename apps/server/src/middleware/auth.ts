import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return res.status(401).json({ error: 'missing_token' });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.userId, email: payload.email };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'invalid_token' });
  }
};
