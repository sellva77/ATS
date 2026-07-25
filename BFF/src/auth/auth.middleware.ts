import type { Response, NextFunction, RequestHandler } from "express";
import type { Role } from "@prisma/client";
import type { AuthRequest } from "../types/auth.js";
import { verifyToken } from "./jwt.js";

/**
 * authenticate — verifies the Bearer JWT in the Authorization header.
 * Attaches req.user = { id, email, role } on success.
 * Returns 401 Unauthorized on missing / invalid / expired token.
 */
export const authenticate: RequestHandler = (
  req,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    (req as AuthRequest).user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
};

/**
 * authorize(...roles) — variadic role-check middleware.
 * Must be used AFTER authenticate.
 * Returns 403 Forbidden if the user's role is not in the allowed list.
 *
 * Usage:
 *   router.delete("/candidates/:id", authenticate, authorize(Role.RECRUITER, Role.ADMIN), handler);
 */
export const authorize =
  (...roles: Role[]): RequestHandler =>
  (req, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;

    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ success: false, error: "Forbidden" });
      return;
    }

    next();
  };
