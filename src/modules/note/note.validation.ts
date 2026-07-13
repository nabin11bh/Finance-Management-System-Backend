import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1, "title is required").max(255),
  description: z.string().min(1, "description is required"),
  colorLabel: z.string().optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

export const listNoteQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  is_pinned: z.string().optional(),
  is_archived: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid("id must be a valid UUID"),
});