import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { sendError } from "../utils/response";

export interface AuthPayload {
  sub: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authGuard(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return sendError(res, 401, "UNAUTHORIZED", "Missing or invalid Authorization header");
  }

  const token = header.slice("Bearer ".length);
  try {
    req.user = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    return next();
  } catch {
    return sendError(res, 401, "UNAUTHORIZED", "Access token is invalid or expired");
  }
}