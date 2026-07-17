import { z } from "zod";

export const listAuditQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  action: z.string().optional(),
  entity_type: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});