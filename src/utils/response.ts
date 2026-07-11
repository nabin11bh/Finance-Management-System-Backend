import { Response } from "express";

export function sendSuccess(
  res: Response,
  data: unknown,
  status = 200,
  meta?: { page: number; limit: number; total: number; totalPages: number }
) {
  return res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function sendError(res: Response, status: number, code: string, message: string, details?: unknown) {
  return res.status(status).json({ success: false, error: { code, message, ...(details ? { details } : {}) } });
}