import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { signToken } from "./jwt.js";

/** Safe user object — never includes the password field. */
export interface SafeUser {
  id: string;
  email: string;
  role: Role;
}

export interface AuthResult {
  token: string;
  user: SafeUser;
}

/**
 * login — validates email + password.
 * Throws structured errors with an httpStatus field for the controller.
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const err: any = new Error("User not found");
    err.httpStatus = 404;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    const err: any = new Error("Invalid credentials");
    err.httpStatus = 401;
    throw err;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
  };
}

/**
 * register — creates a new user.
 * Intended for development / admin seeding only.
 * Throws 409 if email already exists.
 */
export async function register(
  email: string,
  password: string,
  role: Role = "INTERVIEWER"
): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const err: any = new Error("Email already exists");
    err.httpStatus = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashed, role },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
  };
}

/**
 * getMe — retrieves an authenticated user by ID.
 * Never returns the password field.
 */
export async function getMe(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    const err: any = new Error("User not found");
    err.httpStatus = 404;
    throw err;
  }

  return { id: user.id, email: user.email, role: user.role };
}
