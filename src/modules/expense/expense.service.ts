import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { writeAuditLog } from "../../services/audit.service";
import { parsePagination, buildMeta } from "../../utils/pagination";

interface CreateExpenseInput {
  expenseDate: string;
  amount: number;
  expenseCategoryId: string;
  vendorName?: string;
  paymentMethod: string;
  billNumber?: string;
  description?: string;
}

interface UpdateExpenseInput {
  expenseDate?: string;
  amount?: number;
  expenseCategoryId?: string;
  vendorName?: string;
  paymentMethod?: string;
  billNumber?: string;
  description?: string;
}

interface ListExpenseQuery {
  page?: string;
  limit?: string;
  from?: string;
  to?: string;
  category_id?: string;
  payment_method?: string;
  amount_min?: number;
  amount_max?: number;
  vendor_name?: string;
  search?: string;
}

async function assertCategoryExists(categoryId: string) {
  const category = await prisma.expenseCategory.findFirst({
    where: { id: categoryId, deletedAt: null },
  });
  if (!category) {
    throw new AppError(422, "INVALID_CATEGORY", "expense_category_id does not reference a valid category");
  }
}

export async function createExpense(input: CreateExpenseInput, userId: string, ip?: string) {
  await assertCategoryExists(input.expenseCategoryId);

  const expense = await prisma.expense.create({
    data: {
      expenseDate: new Date(input.expenseDate),
      amount: input.amount,
      expenseCategoryId: input.expenseCategoryId,
      vendorName: input.vendorName,
      paymentMethod: input.paymentMethod,
      billNumber: input.billNumber,
      description: input.description,
      createdBy: userId,
    },
    include: { category: true },
  });

  await writeAuditLog({
    userId,
    action: "EXPENSE_CREATED",
    entityType: "expense",
    entityId: expense.id,
    newValues: expense,
    ipAddress: ip,
  });

  return expense;
}

export async function listExpense(query: ListExpenseQuery) {
  const { page, limit } = parsePagination(query);

  const where: Prisma.ExpenseWhereInput = { deletedAt: null };

  if (query.from || query.to) {
    where.expenseDate = {};
    if (query.from) where.expenseDate.gte = new Date(query.from);
    if (query.to) where.expenseDate.lte = new Date(query.to);
  }
  if (query.category_id) where.expenseCategoryId = query.category_id;
  if (query.payment_method) where.paymentMethod = query.payment_method;
  if (query.amount_min !== undefined || query.amount_max !== undefined) {
    where.amount = {};
    if (query.amount_min !== undefined) where.amount.gte = query.amount_min;
    if (query.amount_max !== undefined) where.amount.lte = query.amount_max;
  }
  if (query.vendor_name) where.vendorName = { contains: query.vendor_name, mode: "insensitive" };
  if (query.search) {
    where.OR = [
      { description: { contains: query.search, mode: "insensitive" } },
      { vendorName: { contains: query.search, mode: "insensitive" } },
      { billNumber: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [records, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { expenseDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  return { records, meta: buildMeta(page, limit, total) };
}

export async function getExpenseById(id: string) {
  const expense = await prisma.expense.findFirst({
    where: { id, deletedAt: null },
    include: { category: true },
  });
  if (!expense) throw new AppError(404, "NOT_FOUND", "Expense record not found");
  return expense;
}

export async function updateExpense(id: string, input: UpdateExpenseInput, userId: string, ip?: string) {
  const existing = await getExpenseById(id);

  if (input.expenseCategoryId) await assertCategoryExists(input.expenseCategoryId);

  const updated = await prisma.expense.update({
    where: { id },
    data: {
      ...(input.expenseDate && { expenseDate: new Date(input.expenseDate) }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.expenseCategoryId && { expenseCategoryId: input.expenseCategoryId }),
      ...(input.vendorName !== undefined && { vendorName: input.vendorName }),
      ...(input.paymentMethod && { paymentMethod: input.paymentMethod }),
      ...(input.billNumber !== undefined && { billNumber: input.billNumber }),
      ...(input.description !== undefined && { description: input.description }),
      updatedBy: userId,
    },
    include: { category: true },
  });

  await writeAuditLog({
    userId,
    action: "EXPENSE_UPDATED",
    entityType: "expense",
    entityId: id,
    oldValues: existing,
    newValues: updated,
    ipAddress: ip,
  });

  return updated;
}

export async function deleteExpense(id: string, userId: string, ip?: string) {
  const existing = await getExpenseById(id);

  await prisma.expense.update({
    where: { id },
    data: { deletedAt: new Date(), updatedBy: userId },
  });

  await writeAuditLog({
    userId,
    action: "EXPENSE_DELETED",
    entityType: "expense",
    entityId: id,
    oldValues: existing,
    ipAddress: ip,
  });
}