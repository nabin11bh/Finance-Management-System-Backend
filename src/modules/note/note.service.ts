import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { writeAuditLog } from "../../services/audit.service";
import { parsePagination, buildMeta } from "../../utils/pagination";

interface CreateNoteInput {
  title: string;
  description: string;
  colorLabel?: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

interface UpdateNoteInput extends Partial<CreateNoteInput> {}

interface ListNoteQuery {
  page?: string;
  limit?: string;
  search?: string;
  is_pinned?: string;
  is_archived?: string;
}

export async function createNote(input: CreateNoteInput, userId: string, ip?: string) {
  const note = await prisma.note.create({
    data: { ...input, createdBy: userId },
  });

  await writeAuditLog({ userId, action: "NOTE_CREATED", entityType: "note", entityId: note.id, newValues: note, ipAddress: ip });
  return note;
}

export async function listNotes(query: ListNoteQuery) {
  const { page, limit } = parsePagination(query);

  const where: Prisma.NoteWhereInput = { deletedAt: null };

  // Default excludes archived unless explicitly requested (SRS §12)
  if (query.is_archived === "true") {
    where.isArchived = true;
  } else if (query.is_archived === "false" || query.is_archived === undefined) {
    where.isArchived = false;
  }

  if (query.is_pinned === "true") where.isPinned = true;
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [records, total] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.note.count({ where }),
  ]);

  return { records, meta: buildMeta(page, limit, total) };
}

export async function getNoteById(id: string) {
  const note = await prisma.note.findFirst({ where: { id, deletedAt: null } });
  if (!note) throw new AppError(404, "NOT_FOUND", "Note not found");
  return note;
}

export async function updateNote(id: string, input: UpdateNoteInput, userId: string, ip?: string) {
  const existing = await getNoteById(id);
  const updated = await prisma.note.update({ where: { id }, data: input });

  await writeAuditLog({ userId, action: "NOTE_UPDATED", entityType: "note", entityId: id, oldValues: existing, newValues: updated, ipAddress: ip });
  return updated;
}

export async function deleteNote(id: string, userId: string, ip?: string) {
  const existing = await getNoteById(id);
  await prisma.note.update({ where: { id }, data: { deletedAt: new Date() } });

  await writeAuditLog({ userId, action: "NOTE_DELETED", entityType: "note", entityId: id, oldValues: existing, ipAddress: ip });
}

export async function togglePin(id: string, isPinned: boolean, userId: string) {
  await getNoteById(id);
  return prisma.note.update({ where: { id }, data: { isPinned } });
}

export async function toggleArchive(id: string, isArchived: boolean, userId: string) {
  await getNoteById(id);
  return prisma.note.update({ where: { id }, data: { isArchived } });
}