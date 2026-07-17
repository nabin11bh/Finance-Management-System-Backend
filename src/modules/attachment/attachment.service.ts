import { prisma } from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { writeAuditLog } from "../../services/audit.service";
import { getStorageService } from "../../providers/storage";

const VALID_ENTITY_TYPES = ["income", "expense", "reminder"] as const;
type EntityType = (typeof VALID_ENTITY_TYPES)[number];

async function assertEntityExists(entityType: EntityType, entityId: string) {
  let record;
  if (entityType === "income") record = await prisma.income.findFirst({ where: { id: entityId, deletedAt: null } });
  else if (entityType === "expense") record = await prisma.expense.findFirst({ where: { id: entityId, deletedAt: null } });
  else record = await prisma.reminder.findFirst({ where: { id: entityId, deletedAt: null } });

  if (!record) throw new AppError(404, "NOT_FOUND", `${entityType} record not found`);
}

export async function uploadAttachments(
  entityType: EntityType,
  entityId: string,
  files: Express.Multer.File[],
  userId: string,
  ip?: string
) {
  await assertEntityExists(entityType, entityId);
  if (!files || files.length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", "No files were uploaded");
  }

  const storage = getStorageService();
  const created = [];

  for (const file of files) {
    const result = await storage.upload(file, entityType);
    const attachment = await prisma.attachment.create({
      data: {
        entityType,
        entityId,
        fileName: file.originalname,
        fileSize: BigInt(file.size),
        mimeType: file.mimetype,
        storageKey: result.storageKey,
        storageUrl: result.storageUrl,
        provider: result.provider,
        uploadedBy: userId,
      },
    });
    created.push(attachment);
  }

  await writeAuditLog({
    userId,
    action: "ATTACHMENT_UPLOADED",
    entityType,
    entityId,
    newValues: { count: created.length, fileNames: files.map((f) => f.originalname) },
    ipAddress: ip,
  });

  return created.map((a) => ({ ...a, fileSize: a.fileSize.toString() }));
}


export async function listAttachments(entityType: EntityType, entityId: string) {
  const attachments = await prisma.attachment.findMany({
    where: { entityType, entityId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  // BigInt doesn't serialize to JSON by default — convert for the API response
  return attachments.map((a) => ({ ...a, fileSize: a.fileSize.toString() }));
}

export async function deleteAttachment(id: string, userId: string, ip?: string) {
  const attachment = await prisma.attachment.findFirst({ where: { id, deletedAt: null } });
  if (!attachment) throw new AppError(404, "NOT_FOUND", "Attachment not found");

  const storage = getStorageService();
  await storage.delete(attachment.storageKey);

  await prisma.attachment.update({ where: { id }, data: { deletedAt: new Date() } });

  await writeAuditLog({
    userId,
    action: "ATTACHMENT_DELETED",
    entityType: attachment.entityType,
    entityId: attachment.entityId,
    oldValues: { fileName: attachment.fileName },
    ipAddress: ip,
  });
}

export async function getAttachmentForDownload(id: string) {
  const attachment = await prisma.attachment.findFirst({ where: { id, deletedAt: null } });
  if (!attachment) throw new AppError(404, "NOT_FOUND", "Attachment not found");
  return attachment;
}

export { VALID_ENTITY_TYPES };
export type { EntityType };