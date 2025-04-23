import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

import dotenv from 'dotenv';
dotenv.config();



export interface JwtPayload {
  _id: unknown;
  username: string;
  email: string;
}

export const authenticateToken = (req: Request): JwtPayload | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  const secretKey = process.env.JWT_SECRET_KEY || '';

  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded as JwtPayload;
  } catch {
    return null;
  }
};


export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, undefined, undefined, undefined, ['UNAUTHENTICATED']);
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
};
