import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as attachmentService from "./attachment.service";
import { getStorageService } from "../../providers/storage";
import { LocalStorageProvider } from "../../providers/storage/LocalStorageProvider";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../middleware/errorHandler";
import fs from "fs";

const entityParamsSchema = z.object({
  entityType: z.enum(["income", "expense", "reminder"]),
  entityId: z.string().uuid(),
});

const idParamSchema = z.object({ id: z.string().uuid() });

export async function uploadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { entityType, entityId } = entityParamsSchema.parse(req.params);
    const files = req.files as Express.Multer.File[];
    const attachments = await attachmentService.uploadAttachments(entityType, entityId, files, req.user!.sub, req.ip);
    return sendSuccess(res, attachments, 201);
  } catch (err) {
    return next(err);
  }
}

export async function listHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { entityType, entityId } = entityParamsSchema.parse(req.params);
    const attachments = await attachmentService.listAttachments(entityType, entityId);
    return sendSuccess(res, attachments);
  } catch (err) {
    return next(err);
  }
}

export async function deleteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    await attachmentService.deleteAttachment(id, req.user!.sub, req.ip);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

export async function downloadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const attachment = await attachmentService.getAttachmentForDownload(id);

    if (attachment.provider === "local") {
      const storage = getStorageService() as LocalStorageProvider;
      const filePath = storage.getFilePath(attachment.storageKey);
      if (!fs.existsSync(filePath)) throw new AppError(404, "NOT_FOUND", "File missing from storage");
      res.setHeader("Content-Type", attachment.mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${attachment.fileName}"`);
      return res.sendFile(filePath);
    }

    // Cloudinary (or any remote provider) already has a public URL — just redirect to it
    return res.redirect(attachment.storageUrl);
  } catch (err) {
    return next(err);
  }
}