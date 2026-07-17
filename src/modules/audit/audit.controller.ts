import { Request, Response, NextFunction } from "express";
import { listAuditQuerySchema } from "./audit.validation";
import * as auditService from "./audit.service";

export async function listAuditHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listAuditQuerySchema.parse(req.query);
    const { records, meta } = await auditService.listAuditLogs(query);
    return res.status(200).json({ success: true, data: { records, meta } });
  } catch (err) {
    return next(err);
  }
}