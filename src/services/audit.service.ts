import { prisma } from "../config/database";

interface AuditEntry {
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string | null;
}

export async function writeAuditLog(entry: AuditEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        entityType: entry.entityType ?? null,
        entityId: entry.entityId ?? null,
        oldValues: entry.oldValues ? JSON.parse(JSON.stringify(entry.oldValues)) : undefined,
        newValues: entry.newValues ? JSON.parse(JSON.stringify(entry.newValues)) : undefined,
        ipAddress: entry.ipAddress ?? null,
      },
    });
  } catch (err) {
    
    console.error("Failed to write audit log:", err);
  }
}