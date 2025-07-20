import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export function signJwt(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
}

export function verifyJwt(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
