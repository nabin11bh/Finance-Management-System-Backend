import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { parsePagination, buildMeta } from "../../utils/pagination";

interface ListAuditQuery {
  page?: string;
  limit?: string;
  action?: string;
  entity_type?: string;
  from?: string;
  to?: string;
}

export async function listAuditLogs(query: ListAuditQuery) {
  const { page, limit } = parsePagination(query);

  const where: Prisma.AuditLogWhereInput = {};
  if (query.action) where.action = query.action;
  if (query.entity_type) where.entityType = query.entity_type;
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) where.createdAt.lte = new Date(query.to);
  }

  const [records, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  //   userId can be null (e.g. failed login before we know who it was)
  const userIds = [...new Set(records.map((r) => r.userId).filter((id): id is string => id !== null))];
  const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, fullName: true } });
  const userMap = new Map(users.map((u) => [u.id, u.fullName]));

  return {
    records: records.map((r) => ({
      ...r,
      userName: r.userId ? userMap.get(r.userId) ?? "Unknown user" : "System",
    })),
    meta: buildMeta(page, limit, total),
  };
}