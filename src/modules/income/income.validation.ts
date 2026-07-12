import { z } from "zod";

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Cheque", "eSewa", "Khalti", "Other"] as const;

function isNotTooFarInFuture(dateStr: string) {
  const date = new Date(dateStr);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 1);
  return date <= maxDate;
}

export const createIncomeSchema = z.object({
  transactionDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date")
    .refine(isNotTooFarInFuture, "transaction_date cannot be more than 1 day in the future"),
  amount: z.coerce.number().positive("amount must be greater than 0"),
  incomeCategoryId: z.string().uuid("incomeCategoryId must be a valid UUID"),
  incomeSource: z.string().optional(),
  clientName: z.string().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  referenceNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),
  description: z.string().optional(),
});

// PATCH allows partial updates — every field optional, but still validated if present.
export const updateIncomeSchema = createIncomeSchema.partial();

export const listIncomeQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  category_id: z.string().uuid().optional(),
  payment_method: z.enum(PAYMENT_METHODS).optional(),
  amount_min: z.coerce.number().optional(),
  amount_max: z.coerce.number().optional(),
  client_name: z.string().optional(),
  search: z.string().optional(),
});