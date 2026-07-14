import { z } from "zod";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
const STATUSES = ["PENDING", "COMPLETED"] as const;
const REPEATS = ["NONE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as const;

export const createReminderSchema = z.object({
  title: z.string().min(1, "title is required").max(255),
  description: z.string().optional(),
  reminderDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  reminderTime: z.string().optional(),
  priority: z.enum(PRIORITIES),
  status: z.enum(STATUSES).optional(),
  repeat: z.enum(REPEATS).optional(),
});

export const updateReminderSchema = createReminderSchema.partial();

export const listReminderQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  search: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid("id must be a valid UUID"),
});