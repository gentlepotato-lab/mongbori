import jwt from 'jsonwebtoken';
import { config } from '../config';

export type JwtPayload = {
  userId: string;
  email: string;
};

export const signToken = (payload: JwtPayload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};
