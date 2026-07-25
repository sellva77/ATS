import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { Role } from "@prisma/client";

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

/**
 * Sign a JWT token containing user id, email, and role.
 * Expires in env.jwtExpiresIn (default: 7d).
 */
export function signToken(user: { id: string; email: string; role: Role }): string {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

/**
 * Verify a JWT token and return the decoded payload.
 * Throws if the token is invalid or expired.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
