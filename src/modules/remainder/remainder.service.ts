import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { writeAuditLog } from "../../services/audit.service";
import { parsePagination, buildMeta } from "../../utils/pagination";

interface CreateReminderInput {
  title: string;
  description?: string;
  reminderDate: string;
  reminderTime?: string;
  priority: string;
  status?: string;
  repeat?: string;
}

interface UpdateReminderInput extends Partial<CreateReminderInput> {}

interface ListReminderQuery {
  page?: string;
  limit?: string;
  status?: string;
  priority?: string;
  from?: string;
  to?: string;
  search?: string;
}

export async function createReminder(input: CreateReminderInput, userId: string, ip?: string) {
  const reminder = await prisma.reminder.create({
    data: {
      title: input.title,
      description: input.description,
      reminderDate: new Date(input.reminderDate),
      reminderTime: input.reminderTime,
      priority: input.priority,
      status: input.status ?? "PENDING",
      repeat: input.repeat ?? "NONE",
      createdBy: userId,
    },
  });

  await writeAuditLog({ userId, action: "REMINDER_CREATED", entityType: "reminder", entityId: reminder.id, newValues: reminder, ipAddress: ip });
  return reminder;
}

export async function listReminders(query: ListReminderQuery) {
  const { page, limit } = parsePagination(query);

  const where: Prisma.ReminderWhereInput = { deletedAt: null };
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.from || query.to) {
    where.reminderDate = {};
    if (query.from) where.reminderDate.gte = new Date(query.from);
    if (query.to) where.reminderDate.lte = new Date(query.to);
  }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [records, total] = await Promise.all([
    prisma.reminder.findMany({
      where,
      orderBy: [{ reminderDate: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.reminder.count({ where }),
  ]);

  return { records, meta: buildMeta(page, limit, total) };
}

export async function getReminderById(id: string) {
  const reminder = await prisma.reminder.findFirst({ where: { id, deletedAt: null } });
  if (!reminder) throw new AppError(404, "NOT_FOUND", "Reminder not found");
  return reminder;
}

export async function updateReminder(id: string, input: UpdateReminderInput, userId: string, ip?: string) {
  const existing = await getReminderById(id);
  const updated = await prisma.reminder.update({
    where: { id },
    data: {
      ...input,
      ...(input.reminderDate && { reminderDate: new Date(input.reminderDate) }),
    },
  });

  await writeAuditLog({ userId, action: "REMINDER_UPDATED" as any, entityType: "reminder", entityId: id, oldValues: existing, newValues: updated, ipAddress: ip });
  return updated;
}

export async function deleteReminder(id: string, userId: string, ip?: string) {
  const existing = await getReminderById(id);
  await prisma.reminder.update({ where: { id }, data: { deletedAt: new Date() } });

  await writeAuditLog({ userId, action: "REMINDER_DELETED", entityType: "reminder", entityId: id, oldValues: existing, ipAddress: ip });
}

export async function markComplete(id: string, userId: string, ip?: string) {
  await getReminderById(id);
  const updated = await prisma.reminder.update({ where: { id }, data: { status: "COMPLETED" } });

  await writeAuditLog({ userId, action: "REMINDER_COMPLETED", entityType: "reminder", entityId: id, newValues: updated, ipAddress: ip });
  return updated;
}