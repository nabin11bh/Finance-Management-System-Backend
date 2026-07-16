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
        ipAddress: entry.ipAddress ?? null,
        newValues: entry.newValues ? JSON.parse(JSON.stringify(entry.newValues)) : undefined,
      },
    });
  } catch (err) {
    // Audit logging must never break the primary request flow.
    console.error("Failed to write audit log:", err);
  }
}