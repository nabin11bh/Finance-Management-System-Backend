import { z } from "zod";

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Cheque", "eSewa", "Khalti", "Other"] as const;

function isNotTooFarInFuture(dateStr: string) {
  const date = new Date(dateStr);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 1);
  return date <= maxDate;
}

export const createExpenseSchema = z.object({
  expenseDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date")
    .refine(isNotTooFarInFuture, "expense_date cannot be more than 1 day in the future"),
  amount: z.coerce.number().positive("amount must be greater than 0"),
  expenseCategoryId: z.string().uuid("expenseCategoryId must be a valid UUID"),
  vendorName: z.string().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  billNumber: z.string().optional(),
  description: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const listExpenseQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  category_id: z.string().uuid().optional(),
  payment_method: z.enum(PAYMENT_METHODS).optional(),
  amount_min: z.coerce.number().optional(),
  amount_max: z.coerce.number().optional(),
  vendor_name: z.string().optional(),
  search: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid("id must be a valid UUID"),
});