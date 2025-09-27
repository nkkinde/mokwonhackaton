import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthedRequest extends Request { user?: { id: string; email: string } }

export function authGuard(req: AuthedRequest, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization;
  if (!hdr) return res.status(401).json({ error: 'No token' });
  const token = hdr.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
