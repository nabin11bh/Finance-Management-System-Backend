import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { MulterError } from "multer";
import { sendError } from "../utils/response";

export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return sendError(res, 400, "VALIDATION_ERROR", "Request validation failed", err.flatten());
  }

  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return sendError(res, 413, "PAYLOAD_TOO_LARGE", "File exceeds the maximum allowed size");
    }
    return sendError(res, 400, "UPLOAD_ERROR", err.message);
  }

  if (err instanceof Error && err.message === "UNSUPPORTED_FILE_TYPE") {
    return sendError(res, 400, "UNSUPPORTED_FILE_TYPE", "Only PDF, JPG, JPEG, and PNG files are allowed");
  }

  if (err instanceof AppError) {
    return sendError(res, err.status, err.code, err.message, err.details);
  }

  console.error("Unhandled error:", err);
  return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Something went wrong");
}